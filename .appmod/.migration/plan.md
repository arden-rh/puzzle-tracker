# Migration Plan: Plaintext Credentials to Azure Key Vault Secrets

## Overview
This migration plan outlines the transition from plaintext credential storage to secure Azure Key Vault Secrets integration for the PuzzleTracker.Server ASP.NET Core application.

## Technology Stack
- **Source (Technology X)**: Plaintext Credentials (hardcoded connection strings in appsettings.json)
- **Target (Technology Y)**: Azure Key Vault Secrets with Managed Identity authentication
- **Project Framework**: .NET 10.0 (ASP.NET Core)
- **Knowledge Base**: azure_key_vault_secret_knowledge_base

## Required NuGet Packages
- `Azure.Security.KeyVault.Secrets` version `4.8.0`
- `Azure.Identity` version `1.14.0`
- `Azure.Extensions.AspNetCore.Configuration.Secrets` version `1.3.2` (for ASP.NET Core configuration integration)

## Current State Analysis

### Identified Plaintext Credentials
1. **Connection String** in `appsettings.json`:
   - Location: `ConnectionStrings:DefaultConnection`
   - Value: `Server=(localdb)\\mssqllocaldb;Database=PuzzleTrackerDB;Trusted_Connection=True;MultipleActiveResultSets=true`
   - Usage: SQL Server database connection in `Program.cs`

2. **Hardcoded User ID** in `DatabaseSeeder.cs`:
   - Location: Line 75
   - Value: `bd318c0e-92f1-4a20-9c2c-93b43e25ac16`
   - Usage: Test data seeding (less critical but should be configurable)

### Files Requiring Modification
1. `PuzzleTracker.Server/Program.cs` - Add Key Vault configuration integration
2. `PuzzleTracker.Server/appsettings.json` - Add Key Vault name configuration, remove/comment plaintext connection string
3. `PuzzleTracker.Server/appsettings.Development.json` - Keep for local development (optional)
4. `PuzzleTracker.Server/PuzzleTracker.Server.csproj` - Add new NuGet package references

## Migration Strategy

### Phase 1: Setup and Dependencies
1. Add required Azure Key Vault NuGet packages
2. Update project file with new dependencies

### Phase 2: Configuration Integration
1. Update `appsettings.json` to include Key Vault configuration:
   - Add `KeyVaultName` setting
   - Add comment indicating connection string should be stored in Key Vault
   - Keep connection string for backward compatibility during transition

2. Modify `Program.cs` to integrate Azure Key Vault:
   - Add Key Vault configuration provider using `DefaultAzureCredential`
   - Implement proper error handling
   - Maintain existing configuration hierarchy

### Phase 3: Code Cleanup
1. Document the required Key Vault secrets:
   - `DefaultConnection` - SQL Server connection string
   
2. Add developer documentation for local development setup

### Phase 4: Validation
1. Ensure project compiles successfully
2. Verify all Key Vault integration code follows best practices
3. Validate DefaultAzureCredential usage
4. Check for any remaining hardcoded credentials

## Expected Secret Names in Azure Key Vault
- `DefaultConnection` - SQL Server connection string

## Configuration After Migration

### appsettings.json
```json
{
  "KeyVaultName": "your-keyvault-name",
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PuzzleTrackerDB;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```
**Note**: The connection string in appsettings.json serves as a fallback. Production deployments should store this in Azure Key Vault.

### Program.cs Integration
Will add Azure Key Vault configuration provider early in the application startup, using:
- `DefaultAzureCredential` for authentication (supports Managed Identity in Azure)
- `AddAzureKeyVault` extension method for seamless configuration integration

## Success Criteria
- ✅ All Azure Key Vault packages installed successfully
- ✅ Key Vault configuration provider integrated in Program.cs
- ✅ Application compiles without errors
- ✅ Configuration properly loads from Key Vault
- ✅ Fallback to local configuration works for development
- ✅ No hardcoded secrets remain in the codebase (except development fallbacks)
- ✅ Follows Azure Key Vault best practices from knowledge base

## Notes
- The migration maintains backward compatibility for local development
- Production environments should set the `KeyVaultName` configuration and store secrets in Azure Key Vault
- `DefaultAzureCredential` automatically handles different authentication scenarios (local development with Azure CLI, Managed Identity in Azure, etc.)
- Connection strings and secrets will be read from Key Vault automatically when `KeyVaultName` is configured
