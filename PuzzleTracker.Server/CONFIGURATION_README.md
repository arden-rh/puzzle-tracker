# 🔧 Configuration Management - README

## Overview

This directory contains Azure-ready configuration management for the PuzzleTracker application, implementing cloud-native best practices and the 12-factor app methodology.

---

## 📁 Configuration Files

| File | Purpose | Environment |
|------|---------|-------------|
| `appsettings.json` | Default settings | All |
| `appsettings.Development.json` | Local development overrides | Development |
| `appsettings.Production.json` | Production environment settings | Production |
| `.env.template` | Environment variables template | Documentation |

---

## 🚀 Quick Links

| Document | Description |
|----------|-------------|
| **[QUICK_START.md](../QUICK_START.md)** | 30-minute Azure deployment guide |
| **[AZURE_DEPLOYMENT_GUIDE.md](../AZURE_DEPLOYMENT_GUIDE.md)** | Complete deployment documentation |
| **[AZURE_CONFIGURATION_EXAMPLES.md](../AZURE_CONFIGURATION_EXAMPLES.md)** | Code examples and patterns |
| **[MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md)** | What changed and why |

---

## 🎯 Configuration Strategy

### Local Development
```bash
# Uses appsettings.Development.json
# Connection to SQL LocalDB
# No Azure Key Vault required
dotnet run
```

### Azure Production
```bash
# Uses appsettings.Production.json
# Azure Key Vault for secrets
# Managed Identity for authentication
# Connection to Azure SQL Database
```

---

## 🔑 Configuration Sources (Priority Order)

1. **Command-line arguments** (highest priority)
2. **Environment variables** (Azure App Service settings)
3. **Azure Key Vault** (secrets)
4. **`appsettings.{Environment}.json`** (environment-specific)
5. **`appsettings.json`** (defaults - lowest priority)

---

## 📝 Configuration Structure

### Current Configuration

```json
{
  "Logging": { ... },
  "AllowedHosts": "*",
  "KeyVaultName": "",                    // Set in Production
  
  "ConnectionStrings": {
    "DefaultConnection": "..."           // From Key Vault in Production
  },
  
  "CorsSettings": {
    "AllowedOrigins": [                  // Environment-specific
      "https://localhost:63257"
    ]
  },
  
  "ApplicationSettings": {
    "SwaggerEndpoint": "/swagger/v1/swagger.json",
    "SwaggerTitle": "PuzzleTracker API v1"
  }
}
```

### Key Configuration Keys

| Key | Purpose | Source |
|-----|---------|--------|
| `KeyVaultName` | Azure Key Vault name | App Service config |
| `ConnectionStrings:DefaultConnection` | Database connection | Key Vault (prod), appsettings (dev) |
| `CorsSettings:AllowedOrigins` | CORS allowed origins | appsettings.{Environment}.json |
| `ApplicationSettings:*` | App-specific settings | appsettings.json |

---

## 🔐 Secrets Management

### Development (Local)
- Secrets in `appsettings.Development.json` (not committed if contains real secrets)
- Or use User Secrets: `dotnet user-secrets set "Key" "Value"`

### Production (Azure)
- All secrets in Azure Key Vault
- Accessed via Managed Identity
- No credentials in code or configuration files

### Azure Key Vault Secret Naming

| Configuration Key | Key Vault Secret Name |
|-------------------|----------------------|
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings--DefaultConnection` |
| `ExternalApi:ApiKey` | `ExternalApi--ApiKey` |
| `Settings:Secret` | `Settings--Secret` |

> Note: Replace `:` with `--` for Key Vault secret names

---

## 🌍 Environment Variables

Set via Azure App Service Configuration or `.env` file:

```bash
# Azure Key Vault
KeyVaultName=kv-puzzletracker-prod

# Database
ConnectionStrings__DefaultConnection=Server=...

# CORS
CorsSettings__AllowedOrigins__0=https://myapp.azurewebsites.net
CorsSettings__AllowedOrigins__1=https://www.myapp.com

# Environment
ASPNETCORE_ENVIRONMENT=Production
```

> Note: Use `__` (double underscore) to represent nested keys in environment variables

---

## 🛠️ How to Add New Configuration

### 1. Add to Configuration Class

```csharp
// Create strongly-typed configuration class
public class MyNewSettings
{
    public string ApiUrl { get; set; } = "";
    public int TimeoutSeconds { get; set; } = 30;
}
```

### 2. Add to appsettings.json

```json
{
  "MyNewSettings": {
    "ApiUrl": "https://api.example.com",
    "TimeoutSeconds": 60
  }
}
```

### 3. Register in Program.cs

```csharp
builder.Services.Configure<MyNewSettings>(
    builder.Configuration.GetSection("MyNewSettings"));
```

### 4. Inject and Use

```csharp
public class MyService
{
    private readonly MyNewSettings _settings;
    
    public MyService(IOptions<MyNewSettings> settings)
    {
        _settings = settings.Value;
    }
}
```

---

## 🔒 How to Add Secrets

### Development
```bash
# Option 1: User Secrets (recommended for local dev)
dotnet user-secrets init
dotnet user-secrets set "MySecret" "MyValue"

# Option 2: Environment variable
export MySecret="MyValue"  # Linux/Mac
$env:MySecret="MyValue"    # PowerShell
```

### Production (Azure Key Vault)
```bash
# Add secret to Key Vault
az keyvault secret set \
  --vault-name your-keyvault-name \
  --name "MySecret" \
  --value "MyValue"

# App automatically loads it via managed identity
# Access in code:
var secret = configuration["MySecret"];
```

---

## ✅ Configuration Checklist

### Before Deployment
- [ ] All secrets moved to Azure Key Vault
- [ ] `appsettings.Production.json` updated with production URLs
- [ ] CORS origins configured for production
- [ ] No hardcoded secrets in any configuration file
- [ ] Key Vault name set in App Service configuration
- [ ] Managed Identity enabled and granted Key Vault access

### After Deployment
- [ ] Verify Key Vault integration in logs
- [ ] Test all configuration values are loaded correctly
- [ ] Verify CORS is working
- [ ] Check database connection
- [ ] Monitor for any configuration-related errors

---

## 📊 Configuration Loading Logs

Look for these in Application Logs:

### Success
```
Azure Key Vault configured successfully: https://your-keyvault.vault.azure.net/
```

### Warning (Local Development)
```
Warning: KeyVaultName is not configured. Skipping Azure Key Vault integration.
```

### Error
```
Error: Failed to configure Azure Key Vault 'your-keyvault': [error details]
```

---

## 🧪 Testing Configuration

### Local Testing
```bash
# Test with development settings
dotnet run --environment Development

# Test with production settings locally
dotnet run --environment Production
```

### Test Configuration Reading
```csharp
[HttpGet("config-test")]
public IActionResult TestConfiguration()
{
    var keyVaultName = _configuration["KeyVaultName"];
    var origins = _configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>();
    
    return Ok(new
    {
        KeyVaultConfigured = !string.IsNullOrEmpty(keyVaultName),
        CorsOriginCount = origins?.Length ?? 0
    });
}
```

---

## 🔧 Troubleshooting Configuration

### Issue: Configuration value is null

**Check priority order:**
1. Is it set in command-line arguments?
2. Is it set in environment variables?
3. Is it in Key Vault? (check secret name format)
4. Is it in `appsettings.{Environment}.json`?
5. Is it in `appsettings.json`?

### Issue: Cannot access Key Vault

**Verify:**
```bash
# 1. Managed Identity is enabled
az webapp identity show --name your-app --resource-group your-rg

# 2. Role assignment exists
az role assignment list --assignee [principal-id]

# 3. Key Vault name is correct
az webapp config appsettings list --name your-app --resource-group your-rg | grep KeyVaultName
```

### Issue: Environment-specific settings not loading

**Check:**
- `ASPNETCORE_ENVIRONMENT` is set correctly
- File name matches environment: `appsettings.Production.json`
- File is included in publish output

---

## 📚 Additional Resources

- [ASP.NET Core Configuration](https://docs.microsoft.com/aspnet/core/fundamentals/configuration/)
- [Azure Key Vault Configuration Provider](https://docs.microsoft.com/aspnet/core/security/key-vault-configuration)
- [Options Pattern](https://docs.microsoft.com/aspnet/core/fundamentals/configuration/options)
- [12-Factor App Config](https://12factor.net/config)

---

## 🎓 Best Practices Summary

✅ **DO:**
- Store secrets in Azure Key Vault
- Use environment variables for environment-specific non-secrets
- Use strongly-typed configuration classes
- Validate configuration on startup
- Use `DefaultAzureCredential` for authentication
- Document all configuration keys

❌ **DON'T:**
- Commit secrets to source control
- Hardcode configuration values in code
- Use connection strings in appsettings.Production.json
- Store sensitive data in environment variables (use Key Vault)
- Deploy without validating configuration

---

## 📞 Support

For configuration issues:
1. Check this README
2. Review `AZURE_DEPLOYMENT_GUIDE.md` troubleshooting section
3. Check `AZURE_CONFIGURATION_EXAMPLES.md` for code examples
4. Review application logs for configuration errors

---

**Last Updated:** 2025-01-XX  
**Configuration Version:** 1.0  
**Status:** ✅ Production Ready
