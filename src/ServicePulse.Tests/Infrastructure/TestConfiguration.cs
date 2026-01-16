namespace ServicePulse.Tests.Infrastructure;

/// <summary>
/// Provides common test configuration methods for ServicePulse tests.
/// </summary>
public static class TestConfiguration
{
    // Environment variable names
    public const string ForwardedHeadersEnabled = "SERVICEPULSE_FORWARDEDHEADERS_ENABLED";
    public const string ForwardedHeadersTrustAllProxies = "SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES";
    public const string ForwardedHeadersKnownProxies = "SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES";
    public const string ForwardedHeadersKnownNetworks = "SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS";

    public const string HttpsEnabled = "SERVICEPULSE_HTTPS_ENABLED";
    public const string HttpsRedirectHttpToHttps = "SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS";
    public const string HttpsPort = "SERVICEPULSE_HTTPS_PORT";
    public const string HttpsEnableHsts = "SERVICEPULSE_HTTPS_ENABLEHSTS";
    public const string HttpsHstsMaxAgeSeconds = "SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS";
    public const string HttpsHstsIncludeSubDomains = "SERVICEPULSE_HTTPS_HSTSINCLUDESUBDOMAINS";

    /// <summary>
    /// Creates a factory with default forwarded headers configuration (enabled, trust all proxies).
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithForwardedHeadersDefaults()
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "true")
            .WithEnvironmentVariable(ForwardedHeadersTrustAllProxies, "true")
            .WithEnvironmentVariable(ForwardedHeadersKnownProxies, null)
            .WithEnvironmentVariable(ForwardedHeadersKnownNetworks, null)
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with forwarded headers disabled.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithForwardedHeadersDisabled()
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "false")
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with specific known proxies.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithKnownProxies(params string[] proxies)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "true")
            .WithEnvironmentVariable(ForwardedHeadersTrustAllProxies, "false")
            .WithEnvironmentVariable(ForwardedHeadersKnownProxies, string.Join(",", proxies))
            .WithEnvironmentVariable(ForwardedHeadersKnownNetworks, null)
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with specific known networks.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithKnownNetworks(params string[] networks)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "true")
            .WithEnvironmentVariable(ForwardedHeadersTrustAllProxies, "false")
            .WithEnvironmentVariable(ForwardedHeadersKnownProxies, null)
            .WithEnvironmentVariable(ForwardedHeadersKnownNetworks, string.Join(",", networks))
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with both known proxies and networks.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithKnownProxiesAndNetworks(string[] proxies, string[] networks)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "true")
            .WithEnvironmentVariable(ForwardedHeadersTrustAllProxies, "false")
            .WithEnvironmentVariable(ForwardedHeadersKnownProxies, string.Join(",", proxies))
            .WithEnvironmentVariable(ForwardedHeadersKnownNetworks, string.Join(",", networks))
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with HSTS enabled (requires Production environment).
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithHstsEnabled(
        int maxAgeSeconds = 31536000,
        bool includeSubDomains = false)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(HttpsEnableHsts, "true")
            .WithEnvironmentVariable(HttpsHstsMaxAgeSeconds, maxAgeSeconds.ToString())
            .WithEnvironmentVariable(HttpsHstsIncludeSubDomains, includeSubDomains.ToString())
            .WithEnvironmentVariable(HttpsRedirectHttpToHttps, "false")
            .WithEnvironment("Production") // HSTS requires non-Development
            .WithHstsExcludedHostsCleared(); // Allow HSTS for localhost in tests
    }

    /// <summary>
    /// Creates a factory with HTTPS redirect enabled.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithHttpsRedirectEnabled(int httpsPort = 443)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(HttpsRedirectHttpToHttps, "true")
            .WithEnvironmentVariable(HttpsPort, httpsPort.ToString())
            .WithEnvironmentVariable(HttpsEnableHsts, "false")
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with all HTTPS features enabled.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithAllHttpsEnabled(
        int httpsPort = 443,
        int maxAgeSeconds = 31536000,
        bool includeSubDomains = false) =>
        new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(HttpsRedirectHttpToHttps, "true")
            .WithEnvironmentVariable(HttpsPort, httpsPort.ToString())
            .WithEnvironmentVariable(HttpsEnableHsts, "true")
            .WithEnvironmentVariable(HttpsHstsMaxAgeSeconds, maxAgeSeconds.ToString())
            .WithEnvironmentVariable(HttpsHstsIncludeSubDomains, includeSubDomains.ToString())
            .WithEnvironment("Production") // HSTS requires non-Development
            .WithHstsExcludedHostsCleared(); // Allow HSTS for localhost in tests

    /// <summary>
    /// Creates a factory with HTTPS disabled.
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithHttpsDisabled()
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(HttpsEnabled, "false")
            .WithEnvironmentVariable(HttpsRedirectHttpToHttps, "false")
            .WithEnvironmentVariable(HttpsEnableHsts, "false")
            .WithEnvironment("Development");
    }

    /// <summary>
    /// Creates a factory with forwarded headers and HTTPS features (reverse proxy scenario).
    /// </summary>
    public static ServicePulseWebApplicationFactory CreateWithForwardedHeadersAndHttps(int httpsPort = 443)
    {
        return new ServicePulseWebApplicationFactory()
            .WithEnvironmentVariable(ForwardedHeadersEnabled, "true")
            .WithEnvironmentVariable(ForwardedHeadersTrustAllProxies, "true")
            .WithEnvironmentVariable(HttpsRedirectHttpToHttps, "true")
            .WithEnvironmentVariable(HttpsPort, httpsPort.ToString())
            .WithEnvironmentVariable(HttpsEnableHsts, "true")
            .WithEnvironment("Production") // HSTS requires non-Development
            .WithHstsExcludedHostsCleared(); // Allow HSTS for localhost in tests
    }
}
