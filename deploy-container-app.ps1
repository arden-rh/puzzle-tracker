# Deploy Using Azure Container Apps (Alternative to App Service)
# No throttling issues!

# Load configuration
if (Test-Path .\.azure-resources.ps1) {
    . .\.azure-resources.ps1
} else {
    Write-Host "❌ Error: .azure-resources.ps1 not found" -ForegroundColor Red
    exit 1
}

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Deploy Using Azure Container Apps" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Using Container Apps instead of App Service" -ForegroundColor Yellow
Write-Host "   This avoids the App Service Plan throttle!" -ForegroundColor Yellow
Write-Host ""

# Generate or use existing suffix
if (-not $env:RANDOM_SUFFIX) {
    $env:RANDOM_SUFFIX = Get-Random -Minimum 1000 -Maximum 9999
    Write-Host "Generated random suffix: $env:RANDOM_SUFFIX" -ForegroundColor Yellow
}

# Container App Environment name (must be valid DNS name)
$containerEnvName = "puzzletracker-env$env:RANDOM_SUFFIX"
$containerAppName = "puzzletracker-app$env:RANDOM_SUFFIX"

Write-Host "Environment: $containerEnvName" -ForegroundColor Cyan
Write-Host "App Name: $containerAppName" -ForegroundColor Cyan
Write-Host ""

try {
    # Step 0: Register required resource providers
    Write-Host "Step 0: Registering required resource providers..." -ForegroundColor Cyan

    $providers = @(
        "Microsoft.App",
        "Microsoft.ContainerRegistry",
        "Microsoft.OperationalInsights"
    )

    foreach ($provider in $providers) {
        Write-Host "  Checking $provider..." -ForegroundColor DarkGray
        $state = az provider show --namespace $provider --query "registrationState" --output tsv 2>$null

        if ($state -ne "Registered") {
            Write-Host "  Registering $provider..." -ForegroundColor Yellow
            az provider register --namespace $provider --wait --output none
            Write-Host "  ✅ $provider registered" -ForegroundColor Green
        } else {
            Write-Host "  ✅ $provider already registered" -ForegroundColor Green
        }
    }

    Write-Host ""

    # Step 1: Check and create Container Apps Environment
    Write-Host "Step 1: Checking Container Apps Environment..." -ForegroundColor Cyan

    $existingEnv = az containerapp env show --name $containerEnvName --resource-group $env:RESOURCE_GROUP 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment already exists" -ForegroundColor Green
    } else {
        Write-Host "Creating new environment..." -ForegroundColor Yellow

        $maxRetries = 3
        $retryCount = 0
        $created = $false

        while (-not $created -and $retryCount -lt $maxRetries) {
            try {
                az containerapp env create `
                    --name $containerEnvName `
                    --resource-group $env:RESOURCE_GROUP `
                    --location $env:LOCATION `
                    --output none 2>&1 | Out-Null

                if ($LASTEXITCODE -eq 0) {
                    $created = $true
                    Write-Host "✅ Environment created" -ForegroundColor Green
                } else {
                    throw "Creation failed"
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Host "⚠️  Environment may be deleting. Generating new name..." -ForegroundColor Yellow
                    $env:RANDOM_SUFFIX = Get-Random -Minimum 1000 -Maximum 9999
                    $containerEnvName = "puzzletracker-env$env:RANDOM_SUFFIX"
                    $containerAppName = "puzzletracker-app$env:RANDOM_SUFFIX"
                    Write-Host "New names: $containerEnvName / $containerAppName" -ForegroundColor Cyan
                    Start-Sleep -Seconds 5
                } else {
                    throw "Failed to create Container Apps Environment after $maxRetries attempts"
                }
            }
        }
    }

    # Step 2: Verify Docker files exist
    Write-Host ""
    Write-Host "Step 2: Verifying Docker configuration..." -ForegroundColor Cyan
    Write-Host "(All building happens in Docker)" -ForegroundColor DarkYellow

    if (-not (Test-Path "Dockerfile")) {
        Write-Host "❌ Error: Dockerfile not found" -ForegroundColor Red
        Write-Host "   Please ensure Dockerfile exists in the project root" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Dockerfile found" -ForegroundColor Green

    if (-not (Test-Path ".dockerignore")) {
        Write-Host "⚠️  Warning: .dockerignore not found" -ForegroundColor Yellow
        Write-Host "   This may include unnecessary files in the build" -ForegroundColor Yellow
    } else {
        Write-Host "✅ .dockerignore found" -ForegroundColor Green
    }

    # Check if Visual Studio is running
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Close Visual Studio before deployment!" -ForegroundColor Yellow
    Write-Host "   VS locks files in .vs/ folder which causes deployment to fail" -ForegroundColor Yellow
    Write-Host ""
    $vsProcess = Get-Process -Name "devenv" -ErrorAction SilentlyContinue
    if ($vsProcess) {
        Write-Host "❌ Visual Studio is currently running!" -ForegroundColor Red
        Write-Host ""
        $response = Read-Host "Do you want to continue anyway? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-Host "Deployment cancelled. Please close Visual Studio and try again." -ForegroundColor Yellow
            exit 0
        }
        Write-Host "⚠️  Proceeding with deployment (may fail due to locked files)..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Visual Studio is not running" -ForegroundColor Green
    }
    Write-Host ""

    # Step 3: Deploy Container App
    Write-Host ""
    Write-Host "Step 3: Deploying Container App (building in Azure)..." -ForegroundColor Cyan

    # Option 1: Deploy from local code (simpler, no registry needed)
    az containerapp up `
        --name $containerAppName `
        --resource-group $env:RESOURCE_GROUP `
        --environment $containerEnvName `
        --location $env:LOCATION `
        --source . `
        --ingress external `
        --target-port 8080

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container App created" -ForegroundColor Green
    } else {
        throw "Failed to create Container App"
    }

    # Step 4: Configure environment variables
    Write-Host ""
    Write-Host "Step 4: Configuring environment variables..." -ForegroundColor Cyan
    
    # Get Key Vault URI
    $keyVaultUri = "https://$env:KEY_VAULT_NAME.vault.azure.net/"
    
    az containerapp update `
        --name $containerAppName `
        --resource-group $env:RESOURCE_GROUP `
        --set-env-vars `
            "AZURE_KEY_VAULT_ENDPOINT=$keyVaultUri" `
            "ASPNETCORE_ENVIRONMENT=Production" `
        --output none

    # Step 8: Enable managed identity
    Write-Host ""
    Write-Host "Step 8: Enabling managed identity..." -ForegroundColor Cyan
    
    az containerapp identity assign `
        --name $containerAppName `
        --resource-group $env:RESOURCE_GROUP `
        --system-assigned `
        --output none

    $principalId = az containerapp identity show `
        --name $containerAppName `
        --resource-group $env:RESOURCE_GROUP `
        --query principalId `
        --output tsv

    # Step 9: Grant Key Vault access
    Write-Host ""
    Write-Host "Step 9: Granting Key Vault access..." -ForegroundColor Cyan
    
    az keyvault set-policy `
        --name $env:KEY_VAULT_NAME `
        --object-id $principalId `
        --secret-permissions get list `
        --output none

    # Get the URL
    $appUrl = az containerapp show `
        --name $containerAppName `
        --resource-group $env:RESOURCE_GROUP `
        --query properties.configuration.ingress.fqdn `
        --output tsv

    Write-Host ""
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "✅ Deployment Complete!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is running at:" -ForegroundColor Cyan
    Write-Host "https://$appUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Container App: $containerAppName" -ForegroundColor Yellow
    Write-Host "Environment: $containerEnvName" -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Note: Resources may need manual cleanup in Azure Portal" -ForegroundColor Yellow
    Write-Host "Resource Group: $env:RESOURCE_GROUP" -ForegroundColor Yellow

    # Try cleanup but don't wait if it hangs
    Write-Host "Attempting cleanup (timeout: 30 seconds)..." -ForegroundColor Yellow

    $cleanupJob = Start-Job -ScriptBlock {
        param($appName, $envName, $rg)
        az containerapp delete --name $appName --resource-group $rg --yes --no-wait 2>$null
        az containerapp env delete --name $envName --resource-group $rg --yes --no-wait 2>$null
    } -ArgumentList $containerAppName, $containerEnvName, $env:RESOURCE_GROUP

    $cleanupJob | Wait-Job -Timeout 30 | Out-Null

    if ($cleanupJob.State -eq 'Running') {
        Write-Host "⚠️  Cleanup still running in background" -ForegroundColor Yellow
        $cleanupJob | Stop-Job
    }

    Remove-Job $cleanupJob -Force -ErrorAction SilentlyContinue
}
