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

# Generate or use existing suffix (persist to file to avoid creating duplicate resources)
$suffixFile = ".azure-suffix"
if (Test-Path $suffixFile) {
    $env:RANDOM_SUFFIX = Get-Content $suffixFile
    Write-Host "Using existing suffix from $suffixFile`: $env:RANDOM_SUFFIX" -ForegroundColor Cyan
} elseif (-not $env:RANDOM_SUFFIX) {
    $env:RANDOM_SUFFIX = Get-Random -Minimum 1000 -Maximum 9999
    $env:RANDOM_SUFFIX | Out-File -FilePath $suffixFile -NoNewline
    Write-Host "Generated random suffix: $env:RANDOM_SUFFIX (saved to $suffixFile)" -ForegroundColor Yellow
} else {
    Write-Host "Using suffix from environment: $env:RANDOM_SUFFIX" -ForegroundColor Cyan
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

    $existingEnv = az containerapp env show --name $containerEnvName --resource-group $env:RESOURCE_GROUP --query "properties.provisioningState" --output tsv 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment exists with state: $existingEnv" -ForegroundColor Green

        # If environment is in a bad state, we need to wait or use a new name
        if ($existingEnv -eq "Deleting") {
            Write-Host "⚠️  Environment is being deleted. Generating new name..." -ForegroundColor Yellow
            $env:RANDOM_SUFFIX = Get-Random -Minimum 1000 -Maximum 9999
            $env:RANDOM_SUFFIX | Out-File -FilePath $suffixFile -NoNewline
            $containerEnvName = "puzzletracker-env$env:RANDOM_SUFFIX"
            $containerAppName = "puzzletracker-app$env:RANDOM_SUFFIX"
            Write-Host "New names: $containerEnvName / $containerAppName" -ForegroundColor Cyan

            # Now create the new environment
            Write-Host "Creating new environment..." -ForegroundColor Yellow
            az containerapp env create `
                --name $containerEnvName `
                --resource-group $env:RESOURCE_GROUP `
                --location $env:LOCATION `
                --output none

            if ($LASTEXITCODE -ne 0) {
                throw "Failed to create Container Apps Environment"
            }
            Write-Host "✅ Environment created" -ForegroundColor Green
        } elseif ($existingEnv -eq "Failed") {
            throw "Environment is in Failed state. Please delete it manually from Azure Portal and try again."
        }
        # If Succeeded or other valid state, we'll use it
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
                    $env:RANDOM_SUFFIX | Out-File -FilePath $suffixFile -NoNewline
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

    # Wait for environment to be fully provisioned
    Write-Host "Waiting for environment to be fully provisioned..." -ForegroundColor Yellow
    $maxWaitSeconds = 300  # 5 minutes
    $waitInterval = 10
    $totalWaited = 0

    while ($totalWaited -lt $maxWaitSeconds) {
        $provisioningState = az containerapp env show `
            --name $containerEnvName `
            --resource-group $env:RESOURCE_GROUP `
            --query "properties.provisioningState" `
            --output tsv 2>$null

        if ($provisioningState -eq "Succeeded") {
            Write-Host "✅ Environment is ready" -ForegroundColor Green
            break
        } elseif ($provisioningState -eq "Failed") {
            throw "Environment provisioning failed"
        } else {
            Write-Host "  Provisioning state: $provisioningState (waiting...)" -ForegroundColor DarkGray
            Start-Sleep -Seconds $waitInterval
            $totalWaited += $waitInterval
        }
    }

    if ($totalWaited -ge $maxWaitSeconds) {
        throw "Environment provisioning timeout after $maxWaitSeconds seconds"
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

    # Step 3: Build Docker image locally
    Write-Host ""
    Write-Host "Step 3: Building Docker image locally..." -ForegroundColor Cyan
    Write-Host "(Building on your machine - ACR Tasks not available)" -ForegroundColor DarkYellow

    $imageName = "puzzletracker"
    $imageTag = "latest"

    Write-Host "Building image: $imageName`:$imageTag" -ForegroundColor Yellow
    docker build -t $imageName`:$imageTag .

    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed. Make sure Docker Desktop is running."
    }
    Write-Host "✅ Image built successfully" -ForegroundColor Green

    # Step 4: Create Azure Container Registry
    Write-Host ""
    Write-Host "Step 4: Setting up Azure Container Registry..." -ForegroundColor Cyan

    $acrName = "puzzletracker$env:RANDOM_SUFFIX"

    # Check if ACR exists
    $existingAcr = az acr show --name $acrName --resource-group $env:RESOURCE_GROUP 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ACR already exists: $acrName" -ForegroundColor Green
    } else {
        Write-Host "Creating ACR: $acrName..." -ForegroundColor Yellow
        az acr create `
            --name $acrName `
            --resource-group $env:RESOURCE_GROUP `
            --location $env:LOCATION `
            --sku Basic `
            --admin-enabled true `
            --output none

        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create Azure Container Registry"
        }
        Write-Host "✅ ACR created" -ForegroundColor Green
    }

    # Get ACR login server
    $acrLoginServer = az acr show --name $acrName --resource-group $env:RESOURCE_GROUP --query loginServer --output tsv
    Write-Host "ACR Login Server: $acrLoginServer" -ForegroundColor Cyan

    # Step 5: Push image to ACR
    Write-Host ""
    Write-Host "Step 5: Pushing image to Azure Container Registry..." -ForegroundColor Cyan

    # Login to ACR
    Write-Host "Logging into ACR..." -ForegroundColor Yellow
    az acr login --name $acrName

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to login to ACR"
    }

    # Tag image for ACR
    $acrImageName = "$acrLoginServer/$imageName`:$imageTag"
    Write-Host "Tagging image: $acrImageName" -ForegroundColor Yellow
    docker tag $imageName`:$imageTag $acrImageName

    # Push to ACR
    Write-Host "Pushing image to ACR (this may take a few minutes)..." -ForegroundColor Yellow
    docker push $acrImageName

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to push image to ACR"
    }
    Write-Host "✅ Image pushed to ACR" -ForegroundColor Green

    # Step 6: Deploy Container App from ACR image
    Write-Host ""
    Write-Host "Step 6: Deploying Container App from ACR image..." -ForegroundColor Cyan

    # Get ACR credentials
    $acrUsername = az acr credential show --name $acrName --query username --output tsv
    $acrPassword = az acr credential show --name $acrName --query "passwords[0].value" --output tsv

    # Check if container app already exists
    $existingApp = az containerapp show --name $containerAppName --resource-group $env:RESOURCE_GROUP 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Updating existing container app..." -ForegroundColor Yellow
        az containerapp update `
            --name $containerAppName `
            --resource-group $env:RESOURCE_GROUP `
            --image $acrImageName `
            --output none
    } else {
        Write-Host "Creating new container app..." -ForegroundColor Yellow
        az containerapp create `
            --name $containerAppName `
            --resource-group $env:RESOURCE_GROUP `
            --environment $containerEnvName `
            --image $acrImageName `
            --registry-server $acrLoginServer `
            --registry-username $acrUsername `
            --registry-password $acrPassword `
            --ingress external `
            --target-port 8080 `
            --output none
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Container App deployed" -ForegroundColor Green
    } else {
        throw "Failed to deploy Container App"
    }

    # Step 7: Configure environment variables
    Write-Host ""
    Write-Host "Step 7: Configuring environment variables..." -ForegroundColor Cyan
    
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

    # Check if Key Vault uses RBAC or Access Policies
    $rbacEnabled = az keyvault show --name $env:KEY_VAULT_NAME --query "properties.enableRbacAuthorization" --output tsv

    if ($rbacEnabled -eq "true") {
        Write-Host "Key Vault uses RBAC authorization - assigning role..." -ForegroundColor Yellow

        # Get Key Vault resource ID
        $keyVaultId = az keyvault show --name $env:KEY_VAULT_NAME --query id --output tsv

        # Assign "Key Vault Secrets User" role
        az role assignment create `
            --role "Key Vault Secrets User" `
            --assignee $principalId `
            --scope $keyVaultId `
            --output none

        Write-Host "✅ RBAC role assigned" -ForegroundColor Green
    } else {
        Write-Host "Key Vault uses Access Policies - setting policy..." -ForegroundColor Yellow

        az keyvault set-policy `
            --name $env:KEY_VAULT_NAME `
            --object-id $principalId `
            --secret-permissions get list `
            --output none

        Write-Host "✅ Access policy set" -ForegroundColor Green
    }

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
