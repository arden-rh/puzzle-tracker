# Azure Key Vault Configuration

## Overview
This application is configured to use Azure Key Vault for secure credential management. When deployed to Azure, secrets are automatically loaded from Key Vault using Managed Identity authentication.

## Local Development
For local development, the application falls back to using connection strings from `appsettings.json` or `appsettings.Development.json`.

## Required Azure Key Vault Secrets

When deploying to Azure, create the following secrets in your Azure Key Vault:

### DefaultConnection
- **Name**: `DefaultConnection`
- **Description**: SQL Server connection string
- **Example Value**: `Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=PuzzleTrackerDB;Authentication=Active Directory Default;Encrypt=True;`

## Configuration

### appsettings.json
Set the `KeyVaultName` property to your Key Vault name (without the .vault.azure.net suffix):

```json
{
  "KeyVaultName": "your-keyvault-name"
}
```

### Authentication
The application uses `DefaultAzureCredential` which supports:
- **Local Development**: Azure CLI authentication (`az login`)
- **Azure App Service**: Managed Identity (recommended)
- **Azure Functions**: Managed Identity
- **Visual Studio**: Visual Studio account

## Setup Instructions

### 1. Create Azure Key Vault
```bash
az keyvault create --name your-keyvault-name --resource-group your-rg --location eastus
```

### 2. Add Secrets to Key Vault
```bash
az keyvault secret set --vault-name your-keyvault-name --name DefaultConnection --value "your-connection-string"
```

### 3. Configure Managed Identity (for Azure deployments)
```bash
# Enable system-assigned managed identity on your App Service
az webapp identity assign --name your-app-name --resource-group your-rg

# Grant the managed identity access to Key Vault
az keyvault set-policy --name your-keyvault-name --object-id <managed-identity-object-id> --secret-permissions get list
```

### 4. Update Application Configuration
Set the `KeyVaultName` in your App Service configuration:
```bash
az webapp config appsettings set --name your-app-name --resource-group your-rg --settings KeyVaultName=your-keyvault-name
```

## Troubleshooting

### Local Development
- Ensure you're logged in with Azure CLI: `az login`
- Verify you have permission to read secrets from the Key Vault
- Check that `KeyVaultName` is set correctly in `appsettings.Development.json`

### Azure Deployment
- Verify Managed Identity is enabled on the App Service
- Confirm the Managed Identity has been granted access to the Key Vault
- Check Application Insights logs for authentication errors
