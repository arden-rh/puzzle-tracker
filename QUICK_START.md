# 🚀 Quick Start: Deploy to Azure Container Apps

This guide will get your PuzzleTracker application running on Azure Container Apps in under 30 minutes.

**Why Container Apps?** No App Service Plan throttling, better for containerized workloads, and simpler scaling.

---

## Prerequisites ✅

- Azure subscription
- Azure CLI installed ([Install here](https://docs.microsoft.com/cli/azure/install-azure-cli))
- Docker Desktop installed and running
- .NET 10.0 SDK installed
- Visual Studio 2022+ (optional, for local development)

---

## Step 1: Login to Azure (2 minutes)

```powershell
# Login
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your-Subscription-Name"
```

---

## Step 2: Create Configuration File (2 minutes)

Create `.azure-resources.ps1` in your project root:

```powershell
# Azure Resource Configuration
$env:RESOURCE_GROUP = "rg-puzzle-tracker"
$env:LOCATION = "swedencentral"
$env:KEY_VAULT_NAME = "kv-puzzle-XXXX"  # Replace XXXX with unique value

Write-Host "✅ Configuration loaded" -ForegroundColor Green
Write-Host "  Resource Group: $env:RESOURCE_GROUP" -ForegroundColor Cyan
Write-Host "  Location: $env:LOCATION" -ForegroundColor Cyan
Write-Host "  Key Vault: $env:KEY_VAULT_NAME" -ForegroundColor Cyan
```

**Create the Azure resources:**

```powershell
# Load configuration
. .\.azure-resources.ps1

# Create resource group
az group create --name $env:RESOURCE_GROUP --location $env:LOCATION

# Create Key Vault with RBAC authorization
az keyvault create `
  --name $env:KEY_VAULT_NAME `
  --resource-group $env:RESOURCE_GROUP `
  --location $env:LOCATION `
  --enable-rbac-authorization true

# Assign yourself Key Vault Administrator role (for setting secrets)
$yourUserId = az ad signed-in-user show --query id --output tsv
$keyVaultId = az keyvault show --name $env:KEY_VAULT_NAME --query id --output tsv

az role assignment create `
  --role "Key Vault Administrator" `
  --assignee $yourUserId `
  --scope $keyVaultId
```

---

## Step 3: Deploy Container App (5 minutes)

**Close Visual Studio** (it locks files that Docker needs)

```powershell
# Run the deployment script
.\deploy-container-app.ps1
```

**What this script does:**
- ✅ Registers required Azure resource providers
- ✅ Creates Container Apps Environment
- ✅ Builds your Docker image locally (React + .NET)
- ✅ Creates Azure Container Registry (ACR)
- ✅ Pushes image to ACR
- ✅ Deploys Container App
- ✅ Configures environment variables
- ✅ Enables managed identity
- ✅ Grants Key Vault access

**After deployment completes**, you'll see:
```
==========================================
✅ Deployment Complete!
==========================================

Your app is running at:
https://puzzletracker-app1234.region.azurecontainerapps.io

Container App: puzzletracker-app1234
Environment: puzzletracker-env1234
```

**Note:** The app won't fully work yet - you need to set up the database (next steps).

---

## Step 4: Create SQL Server & Database (5 minutes)

```powershell
# Load configuration
. .\.azure-resources.ps1

# Generate unique SQL Server name
$sqlServerName = "sql-puzzle-$(Get-Random -Minimum 1000 -Maximum 9999)"
$sqlAdminUser = "sqladmin"
$sqlAdminPassword = "P@ssw0rd$(Get-Random -Minimum 1000 -Maximum 9999)!"
$sqlDatabaseName = "PuzzleTrackerDB"

Write-Host "SQL Server: $sqlServerName" -ForegroundColor Cyan
Write-Host "SQL Admin: $sqlAdminUser" -ForegroundColor Cyan
Write-Host "⚠️  Save the password: $sqlAdminPassword" -ForegroundColor Yellow

# Create SQL Server
az sql server create `
  --name $sqlServerName `
  --resource-group $env:RESOURCE_GROUP `
  --location $env:LOCATION `
  --admin-user $sqlAdminUser `
  --admin-password $sqlAdminPassword

# Create SQL Database
az sql db create `
  --resource-group $env:RESOURCE_GROUP `
  --server $sqlServerName `
  --name $sqlDatabaseName `
  --service-objective S0 `
  --backup-storage-redundancy Local

# Allow Azure services to access SQL
az sql server firewall-rule create `
  --resource-group $env:RESOURCE_GROUP `
  --server $sqlServerName `
  --name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0

Write-Host "✅ SQL Server and Database created" -ForegroundColor Green
```

---

## Step 5: Store Connection String in Key Vault (2 minutes)

```powershell
# Create connection string with Managed Identity authentication
$connectionString = "Server=tcp:$sqlServerName.database.windows.net,1433;Initial Catalog=$sqlDatabaseName;Authentication=Active Directory Default;"

# Store in Key Vault
az keyvault secret set `
  --vault-name $env:KEY_VAULT_NAME `
  --name "ConnectionStrings--DefaultConnection" `
  --value $connectionString

Write-Host "✅ Connection string stored in Key Vault" -ForegroundColor Green
```

---

## Step 6: Grant SQL Access to Container App (5 minutes)

```powershell
# Load configuration
. .\.azure-resources.ps1

# Get your Container App name
$suffix = Get-Content .azure-suffix
$containerAppName = "puzzletracker-app$suffix"

Write-Host "Container App: $containerAppName" -ForegroundColor Cyan

# If you don't have $sqlServerName from Step 4, retrieve it:
if (-not $sqlServerName) {
    $sqlServerName = az sql server list `
        --resource-group $env:RESOURCE_GROUP `
        --query "[0].name" `
        --output tsv

    Write-Host "SQL Server: $sqlServerName" -ForegroundColor Cyan
}

# Set yourself as Azure AD admin on SQL Server (required to create AD users)
$yourUserId = az ad signed-in-user show --query id --output tsv
$yourUserEmail = az ad signed-in-user show --query userPrincipalName --output tsv

az sql server ad-admin create `
  --resource-group $env:RESOURCE_GROUP `
  --server-name $sqlServerName `
  --display-name $yourUserEmail `
  --object-id $yourUserId

Write-Host "✅ Azure AD admin set: $yourUserEmail" -ForegroundColor Green
Write-Host "⚠️  Wait 1-2 minutes for AD admin to propagate before continuing..." -ForegroundColor Yellow
```

**Now grant SQL permissions:**

1. **Open Azure Portal** → Navigate to your SQL Database
2. **Query Editor** → Login with **Microsoft Entra authentication** (Azure AD):
   - Click "Continue as [your-email]"
   - **NOT** SQL authentication!
3. **Run this SQL** (replace `####` with your actual suffix from above):

```sql
CREATE USER [puzzletracker-app####] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [puzzletracker-app####];
ALTER ROLE db_datawriter ADD MEMBER [puzzletracker-app####];
ALTER ROLE db_ddladmin ADD MEMBER [puzzletracker-app####];
GO
```

**Verification:**
```sql
-- Verify the user was created
SELECT name, type_desc FROM sys.database_principals WHERE name LIKE 'puzzletracker-app%';
```

---

## Step 7: Run Database Migrations (5 minutes)

```powershell
# Get your IP address (or use ipconfig)
$myIp = (Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Allow your IP to access SQL temporarily
az sql server firewall-rule create `
  --resource-group $env:RESOURCE_GROUP `
  --server $sqlServerName `
  --name AllowMyIP `
  --start-ip-address $myIp `
  --end-ip-address $myIp

# Update connection string for migrations (with SQL authentication)
$migrationsConnectionString = "Server=tcp:$sqlServerName.database.windows.net,1433;Initial Catalog=$sqlDatabaseName;User ID=$sqlAdminUser;Password=$sqlAdminPassword;Encrypt=True;TrustServerCertificate=False;"

# Set environment variable temporarily
$env:ConnectionStrings__DefaultConnection = $migrationsConnectionString

# Run migrations
cd PuzzleTracker.Server
dotnet ef database update
cd ..

# Remove your IP from firewall
az sql server firewall-rule delete `
  --resource-group $env:RESOURCE_GROUP `
  --server $sqlServerName `
  --name AllowMyIP `
  --confirm

Write-Host "✅ Database migrations completed" -ForegroundColor Green
```

---

## Step 8: Restart Container App (1 minute)

```powershell
# Update the container app to force a restart and pick up the new connection string
az containerapp update `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP

Write-Host "✅ Container App restarted" -ForegroundColor Green
```

---

## Step 9: Verify Deployment (3 minutes)

```powershell
# Get your app URL
$appUrl = az containerapp show `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn `
  --output tsv

Write-Host ""
Write-Host "Your app is running at:" -ForegroundColor Cyan
Write-Host "https://$appUrl" -ForegroundColor White

# Open in browser
Start-Process "https://$appUrl"
```

**Check the logs:**
```powershell
az containerapp logs show `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --tail 100
```

**What to look for:**
- ✅ `Azure Key Vault configured successfully: https://...`
- ✅ Database connection successful
- ✅ No authentication errors
- ✅ Application started successfully

**Test the API:**
```powershell
# Test API endpoint
Invoke-WebRequest -Uri "https://$appUrl/api/brands"
```

---

## 🎉 Success!

Your application is now running on Azure with:
- ✅ Azure Container Apps (auto-scaling, pay-per-use)
- ✅ Azure Container Registry (private Docker images)
- ✅ Azure Key Vault for secrets (RBAC-based)
- ✅ Managed Identity (no passwords in code)
- ✅ Azure SQL Database
- ✅ Containerized React + .NET app

**Your App URL:** `https://[your-app-url].azurecontainerapps.io`

---

## 📊 View Your Resources

```powershell
# List all resources
az resource list --resource-group $env:RESOURCE_GROUP --output table

# Get Container App details
az containerapp show --name $containerAppName --resource-group $env:RESOURCE_GROUP

# Get Container App logs
az containerapp logs show --name $containerAppName --resource-group $env:RESOURCE_GROUP
```

---

## 🔧 Useful Commands

### Update and Redeploy

```powershell
# Make code changes, then redeploy
.\deploy-container-app.ps1

# The script will:
# - Rebuild the Docker image with your changes
# - Push to ACR
# - Update the Container App with the new image
```

### View Container App Logs (Live)
```powershell
az containerapp logs show `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --follow
```

### Restart the App
```powershell
# Update to force a restart
az containerapp update `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP
```

### Update a Secret
```powershell
# Update secret in Key Vault
az keyvault secret set `
  --vault-name $env:KEY_VAULT_NAME `
  --name "ConnectionStrings--DefaultConnection" `
  --value "new-connection-string"

# Update app to pick up changes (forces restart)
az containerapp update `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP
```

### Scale Container App
```powershell
# Set min/max replicas
az containerapp update `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --min-replicas 0 `
  --max-replicas 5
```

### View Container App Environment Variables
```powershell
az containerapp show `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --query properties.template.containers[0].env
```

---

## 🚨 Troubleshooting

### Issue: "Docker build failed"

**Error:** `Docker build failed. Make sure Docker Desktop is running.`

**Solution:**
1. Start Docker Desktop
2. Close Visual Studio (it locks files)
3. Run `.\deploy-container-app.ps1` again

### Issue: "Cannot access Key Vault"

**Check RBAC role assignment:**
```powershell
# Get Container App principal ID
$principalId = az containerapp identity show `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --query principalId `
  --output tsv

# Verify role assignment
az role assignment list `
  --assignee $principalId `
  --scope (az keyvault show --name $env:KEY_VAULT_NAME --query id --output tsv)
```

### Issue: "Cannot connect to SQL Database"

**Check:**
```powershell
# Verify firewall rules
az sql server firewall-rule list `
  --resource-group $env:RESOURCE_GROUP `
  --server $sqlServerName

# Verify managed identity SQL user exists
# Connect to SQL Query Editor and run:
# SELECT name FROM sys.database_principals WHERE type = 'E';
```

### Issue: "Container App stuck in 'Provisioning'"

**Solution:**
```powershell
# Wait for environment to finish provisioning (up to 5 minutes)
# The deploy script now handles this automatically

# If stuck, check provisioning state:
az containerapp env show `
  --name (Get-Content .azure-suffix | ForEach-Object { "puzzletracker-env$_" }) `
  --resource-group $env:RESOURCE_GROUP `
  --query "properties.provisioningState"
```

### Issue: "MissingSubscriptionRegistration"

**Solution:**
```powershell
# The deploy script automatically registers these, but you can manually do it:
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.ContainerRegistry
az provider register --namespace Microsoft.OperationalInsights

# Wait for registration (1-2 minutes)
az provider show --namespace Microsoft.App --query "registrationState"
```

### Issue: "ACR Tasks not permitted"

**This is expected!** The deployment script builds locally instead of using ACR Tasks. Make sure:
- Docker Desktop is running
- Visual Studio is closed
- Run `.\deploy-container-app.ps1`

### Issue: Container App shows old version

**Solution:**
```powershell
# Force new image pull
az containerapp update `
  --name $containerAppName `
  --resource-group $env:RESOURCE_GROUP `
  --force-update
```

---

## 🧹 Clean Up (Optional)

To delete all resources and avoid charges:

```powershell
# Load configuration
. .\.azure-resources.ps1

# Delete the entire resource group
az group delete --name $env:RESOURCE_GROUP --yes --no-wait

# Clean up local files
Remove-Item .azure-suffix -ErrorAction SilentlyContinue

Write-Host "✅ All resources deleted" -ForegroundColor Green
```

---

## 📚 Next Steps

- [ ] Configure custom domain for Container App
- [ ] Set up Application Insights for monitoring
- [ ] Configure GitHub Actions for CI/CD
- [ ] Set up deployment slots (blue/green deployments)
- [ ] Configure auto-scaling rules
- [ ] Add Azure Front Door for global distribution
- [ ] Set up backup and disaster recovery for SQL

**Useful Resources:**
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Container Apps pricing](https://azure.microsoft.com/pricing/details/container-apps/)
- `MIGRATION_SUMMARY.md` - What was changed and why
- `deploy-container-app.ps1` - Deployment script source

---

## 💰 Cost Estimate

**Monthly costs (approximate):**
- Container Apps: $5-15/month (consumption-based, scales to zero)
- Azure Container Registry (Basic): $5/month
- Azure SQL Database (S0): $15/month
- Key Vault: $0.03/10,000 operations
- **Total: ~$25-35/month**

**Cost optimization tips:**
- Set `--min-replicas 0` to scale to zero when idle
- Use Azure SQL Database serverless tier for dev/test
- Use GitHub Container Registry instead of ACR for public projects

---

**Estimated Total Time: 25-30 minutes** ⏱️  
**Difficulty: Intermediate** 🟡 (Docker knowledge helpful)  
**Cost: ~$25-35/month** 💰
