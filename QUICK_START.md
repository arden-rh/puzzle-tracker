# 🚀 Quick Start: Deploy to Azure

This is a condensed guide to get your PuzzleTracker application running on Azure in under 30 minutes.

---

## Prerequisites ✅

- Azure subscription
- Azure CLI installed ([Install here](https://docs.microsoft.com/cli/azure/install-azure-cli))
- .NET 10.0 SDK installed

---

## Step 1: Login to Azure (2 minutes)

```bash
# Login
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "Your-Subscription-Name"
```

---

## Step 2: Create Azure Resources (5 minutes)

### Option A: Use Name Generator Script (Recommended)

**For Linux/Mac/Git Bash:**
```bash
# Run the name generator script
chmod +x generate-azure-names.sh
./generate-azure-names.sh

# Load the generated variables
source .azure-resources.env
```

**For Windows PowerShell:**
```powershell
# Run the name generator script
.\generate-azure-names.ps1

# Variables are automatically set if you chose 'y'
```

### Option B: Manual Variable Setup

```bash
# Set variables (customize these!)
RESOURCE_GROUP="rg-puzzletracker"
LOCATION="swedencentral"
KEY_VAULT_NAME="kv-puzzle-$(openssl rand -hex 4)"  # Generates unique name
SQL_SERVER_NAME="sql-puzzle-$(openssl rand -hex 4)"
SQL_DB_NAME="PuzzleTrackerDB"
APP_SERVICE_NAME="app-puzzle-$(openssl rand -hex 4)"
SQL_ADMIN_USER="sqladmin"
SQL_ADMIN_PASSWORD="P@ssw0rd$(openssl rand -hex 4)!"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Key Vault
az keyvault create \
  --name $KEY_VAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --enable-rbac-authorization true

# Create SQL Server
az sql server create \
  --name $SQL_SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $SQL_ADMIN_USER \
  --admin-password $SQL_ADMIN_PASSWORD

# Create SQL Database
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name $SQL_DB_NAME \
  --service-objective S0

# Allow Azure services to access SQL
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Create App Service Plan
az appservice plan create \
  --name plan-puzzletracker \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan plan-puzzletracker \
  --runtime "DOTNET:10.0"

echo "✅ Resources created successfully!"
echo "App Service: https://$APP_SERVICE_NAME.azurewebsites.net"
```

---

## Step 3: Configure Managed Identity (3 minutes)

```bash
# Enable managed identity
az webapp identity assign \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP

# Get the managed identity ID
PRINCIPAL_ID=$(az webapp identity show \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query principalId -o tsv)

# Grant Key Vault access
az role assignment create \
  --role "Key Vault Secrets User" \
  --assignee $PRINCIPAL_ID \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME"

echo "✅ Managed Identity configured!"
```

---

## Step 4: Store Secrets in Key Vault (2 minutes)

```bash
# Create connection string for Azure SQL with Managed Identity
CONNECTION_STRING="Server=tcp:$SQL_SERVER_NAME.database.windows.net,1433;Initial Catalog=$SQL_DB_NAME;Authentication=Active Directory Default;"

# Store in Key Vault
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "ConnectionStrings--DefaultConnection" \
  --value "$CONNECTION_STRING"

echo "✅ Secrets stored in Key Vault!"
```

---

## Step 5: Grant SQL Database Access to Managed Identity (3 minutes)

```bash
# Get the App Service managed identity object ID
MANAGED_IDENTITY_NAME=$APP_SERVICE_NAME

# Connect to your SQL database using Azure portal Query Editor or Azure Data Studio
# Then run this SQL:
```

**Open Azure Portal → SQL Database → Query Editor**, login with SQL admin, and run:

```sql
CREATE USER [app-puzzle-XXXX] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [app-puzzle-XXXX];
ALTER ROLE db_datawriter ADD MEMBER [app-puzzle-XXXX];
ALTER ROLE db_ddladmin ADD MEMBER [app-puzzle-XXXX];
GO
```

> Replace `app-puzzle-XXXX` with your actual App Service name from `$APP_SERVICE_NAME`

---

## Step 6: Configure App Service (2 minutes)

```bash
# Set Key Vault name
az webapp config appsettings set \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    KeyVaultName=$KEY_VAULT_NAME \
    ASPNETCORE_ENVIRONMENT=Production \
    CorsSettings__AllowedOrigins__0="https://$APP_SERVICE_NAME.azurewebsites.net"

# Enable HTTPS only
az webapp update \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --https-only true

echo "✅ App Service configured!"
```

---

## Step 7: Update Production Configuration File (2 minutes)

Update `PuzzleTracker.Server\appsettings.Production.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "KeyVaultName": "",
  "ConnectionStrings": {
    "DefaultConnection": ""
  },
  "CorsSettings": {
    "AllowedOrigins": [
      "https://YOUR-APP-SERVICE-NAME.azurewebsites.net"
    ]
  }
}
```

> Replace `YOUR-APP-SERVICE-NAME` with the value from `$APP_SERVICE_NAME`

---

## Step 8: Deploy Application (5 minutes)

### Option A: Visual Studio

1. Right-click on `PuzzleTracker.Server` project
2. Select **Publish**
3. Choose **Azure → Azure App Service (Linux)**
4. Select your subscription and app service
5. Click **Publish**

### Option B: Azure CLI

```bash
# Navigate to project directory
cd PuzzleTracker.Server

# Publish the app
dotnet publish -c Release -o ./publish

# Create deployment ZIP
cd publish
zip -r ../deploy.zip . # On Windows: Use Compress-Archive or 7-Zip
cd ..

# Deploy to App Service
az webapp deployment source config-zip \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --src deploy.zip

echo "✅ Application deployed!"
```

---

## Step 9: Run Database Migrations (3 minutes)

```bash
# Update connection string temporarily for migrations
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowMyIP \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS

# In your local terminal, run migrations
cd PuzzleTracker.Server
dotnet ef database update

# Remove the firewall rule for security
az sql server firewall-rule delete \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME \
  --name AllowMyIP
```

**Alternative:** Run migrations from Azure Cloud Shell with SQL authentication

---

## Step 10: Verify Deployment (3 minutes)

```bash
# Open the app in browser
az webapp browse --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP

# Check logs
az webapp log tail --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP
```

**What to look for in logs:**
- ✅ `Azure Key Vault configured successfully: https://...`
- ✅ No authentication errors
- ✅ Application started successfully

**Test the API:**
```bash
# Replace with your app URL
curl https://YOUR-APP.azurewebsites.net/api/brands
```

---

## 🎉 Success!

Your application is now running on Azure with:
- ✅ Azure Key Vault for secrets
- ✅ Managed Identity (no passwords in code)
- ✅ Azure SQL Database
- ✅ Secure HTTPS connections
- ✅ Environment-based configuration

**Your App URL:** `https://YOUR-APP-SERVICE-NAME.azurewebsites.net`

---

## 📊 View Your Resources

```bash
# List all resources
az resource list --resource-group $RESOURCE_GROUP --output table

# Get App Service URL
echo "https://$APP_SERVICE_NAME.azurewebsites.net"

# Get Key Vault name
echo $KEY_VAULT_NAME

# Get SQL Server name
echo $SQL_SERVER_NAME
```

---

## 🔧 Useful Commands

### View Application Logs
```bash
az webapp log tail --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP
```

### Restart the App
```bash
az webapp restart --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP
```

### Update a Secret
```bash
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name "ConnectionStrings--DefaultConnection" \
  --value "new-connection-string"

# Restart app to pick up changes
az webapp restart --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP
```

### View App Service Configuration
```bash
az webapp config appsettings list \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --output table
```

---

## 🚨 Troubleshooting

### Issue: "App Service Plan Create operation is throttled"

**Error Message:**
```
App Service Plan Create operation is throttled for subscription XXXXXXXX. 
Please contact support if issue persists.
```

**Cause:** Azure is rate-limiting your subscription. This happens when creating/deleting resources too quickly.

**Solution 1: Wait and Retry (Recommended)**
```bash
# Wait 5-10 minutes for throttle to clear
echo "Waiting for Azure throttle to clear (5 minutes)..."
sleep 300

# Then retry the App Service Plan creation
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku B1 \
  --is-linux
```

**Solution 2: Use Automated Deployment Script**
```bash
# These scripts include retry logic and delays
chmod +x deploy-with-throttle-protection.sh
./deploy-with-throttle-protection.sh

# Or PowerShell:
.\deploy-with-throttle-protection.ps1
```

**Solution 3: Check for Existing Plans**
```bash
# List existing plans in your resource group
az appservice plan list \
  --resource-group $RESOURCE_GROUP \
  --output table

# If one exists, use it:
az webapp create \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan <existing-plan-name> \
  --runtime "DOTNET:10.0"
```

**Prevention:**
- Add 3-5 second delays between Azure CLI commands
- Don't delete and recreate resources in quick succession
- Use the automated deployment scripts provided

### Issue: "MissingSubscriptionRegistration" Error

**Error Message:**
```
(MissingSubscriptionRegistration) The subscription is not registered to use namespace 'Microsoft.KeyVault'
```

**Solution:**
```bash
# Register the required resource provider
az provider register --namespace Microsoft.KeyVault

# Check registration status (wait until it shows "Registered")
az provider show --namespace Microsoft.KeyVault --query "registrationState" -o tsv

# Registration usually takes 1-2 minutes
# Once "Registered", retry your command
```

**For all providers at once:**
```bash
# Register all required providers
az provider register --namespace Microsoft.KeyVault
az provider register --namespace Microsoft.Sql  
az provider register --namespace Microsoft.Web

# Wait for all to complete
echo "Waiting for registrations to complete..."
az provider show --namespace Microsoft.KeyVault --query "registrationState"
az provider show --namespace Microsoft.Sql --query "registrationState"
az provider show --namespace Microsoft.Web --query "registrationState"
```

### Issue: "Cannot connect to SQL Database"

**Check:**
```bash
# Verify firewall rules
az sql server firewall-rule list \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER_NAME

# Verify managed identity has SQL permissions
# Connect to SQL and run: SELECT name FROM sys.database_principals WHERE type = 'E';
```

### Issue: "Cannot access Key Vault"

**Check:**
```bash
# Verify managed identity is assigned
az webapp identity show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP

# Verify role assignment
az role assignment list \
  --assignee $(az webapp identity show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --query principalId -o tsv)
```

### Issue: "CORS errors"

**Fix:**
```bash
# Update CORS settings
az webapp config appsettings set \
  --name $APP_SERVICE_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings CorsSettings__AllowedOrigins__0="https://your-frontend-url.com"
```

---

## 🧹 Clean Up (Optional)

To delete all resources and avoid charges:

```bash
# Delete the entire resource group
az group delete --name $RESOURCE_GROUP --yes --no-wait

echo "✅ All resources deleted"
```

---

## 📚 Next Steps

- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Add Application Insights for monitoring
- [ ] Configure autoscaling
- [ ] Set up deployment slots (staging/production)
- [ ] Configure backup and disaster recovery
- [ ] Set up CI/CD with GitHub Actions

**For detailed guides, see:**
- `AZURE_DEPLOYMENT_GUIDE.md` - Complete deployment documentation
- `AZURE_CONFIGURATION_EXAMPLES.md` - Code examples and patterns
- `MIGRATION_SUMMARY.md` - What was changed and why

---

**Estimated Total Time: 30 minutes** ⏱️  
**Difficulty: Beginner** 🟢  
**Cost: ~$10-20/month** (B1 App Service + S0 SQL Database) 💰
