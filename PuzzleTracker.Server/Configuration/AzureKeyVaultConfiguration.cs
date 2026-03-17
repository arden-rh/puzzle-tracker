using Azure.Identity;
using Azure.Security.KeyVault.Secrets;

namespace PuzzleTracker.Server.Configuration;

/// <summary>
/// Helper class for Azure Key Vault configuration
/// Implements the 12-factor app methodology for configuration management
/// </summary>
public static class AzureKeyVaultConfiguration
{
    /// <summary>
    /// Adds Azure Key Vault to the configuration builder using DefaultAzureCredential
    /// This supports multiple authentication methods:
    /// - Managed Identity (when deployed to Azure)
    /// - Azure CLI (local development)
    /// - Visual Studio (local development)
    /// - Environment variables (CI/CD pipelines)
    /// </summary>
    public static void AddAzureKeyVault(WebApplicationBuilder builder, string keyVaultName)
    {
        if (string.IsNullOrEmpty(keyVaultName))
        {
            Console.WriteLine("Warning: KeyVaultName is not configured. Skipping Azure Key Vault integration.");
            return;
        }

        try
        {
            var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");

            var credential = new DefaultAzureCredential(new DefaultAzureCredentialOptions
            {
                ExcludeEnvironmentCredential = false,
                ExcludeManagedIdentityCredential = false,
                ExcludeSharedTokenCacheCredential = false,
                ExcludeVisualStudioCredential = false,
                ExcludeAzureCliCredential = false,
                ExcludeAzurePowerShellCredential = true,
                ExcludeInteractiveBrowserCredential = true
            });

            builder.Configuration.AddAzureKeyVault(keyVaultUri, credential);

            Console.WriteLine($"Azure Key Vault configured successfully: {keyVaultUri}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: Failed to configure Azure Key Vault '{keyVaultName}': {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Validates that required secrets are available in configuration
    /// </summary>
    public static void ValidateRequiredSecrets(IConfiguration configuration, params string[] requiredKeys)
    {
        var missingKeys = new List<string>();

        foreach (var key in requiredKeys)
        {
            var value = configuration[key];
            if (string.IsNullOrEmpty(value))
            {
                missingKeys.Add(key);
            }
        }

        if (missingKeys.Any())
        {
            throw new InvalidOperationException(
                $"Required configuration keys are missing: {string.Join(", ", missingKeys)}");
        }
    }

    /// <summary>
    /// Gets a secret from Azure Key Vault directly
    /// </summary>
    public static async Task<string?> GetSecretAsync(string keyVaultName, string secretName)
    {
        if (string.IsNullOrEmpty(keyVaultName))
        {
            throw new ArgumentException("Key Vault name cannot be null or empty", nameof(keyVaultName));
        }

        try
        {
            var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");
            var client = new SecretClient(keyVaultUri, new DefaultAzureCredential());
            
            KeyVaultSecret secret = await client.GetSecretAsync(secretName);
            return secret.Value;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to retrieve secret '{secretName}': {ex.Message}");
            return null;
        }
    }
}
