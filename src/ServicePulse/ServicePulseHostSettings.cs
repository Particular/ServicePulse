namespace ServicePulse;

using System.Net;
using Microsoft.Extensions.Logging;
using IPNetwork = Microsoft.AspNetCore.HttpOverrides.IPNetwork;

class ServicePulseHostSettings
{
    static readonly ILogger<ServicePulseHostSettings> logger = LoggerUtil.CreateStaticLogger<ServicePulseHostSettings>();

    public required bool EnableReverseProxy { get; init; }

    /// <summary>
    /// Indicates whether forwarded headers processing for reverse proxy scenarios is enabled.
    /// </summary>
    public required bool ForwardedHeadersEnabled { get; init; }

    /// <summary>
    /// Indicates whether all proxies are trusted for forwarded headers.
    /// </summary>
    public required bool ForwardedHeadersTrustAllProxies { get; init; }

    /// <summary>
    /// List of known proxy IP addresses for forwarded headers.
    /// </summary>
    public required IReadOnlyList<IPAddress> ForwardedHeadersKnownProxies { get; init; }

    /// <summary>
    /// List of known networks for forwarded headers.
    /// </summary>
    public required IReadOnlyList<IPNetwork> ForwardedHeadersKnownNetworks { get; init; }

    /// <summary>
    /// Indicates whether HTTPS is enabled.
    /// </summary>
    public required bool HttpsEnabled { get; init; }

    /// <summary>
    /// Path to the HTTPS certificate file.
    /// </summary>
    public required string? HttpsCertificatePath { get; init; }

    /// <summary>
    /// Password for the HTTPS certificate.
    /// </summary>
    public required string? HttpsCertificatePassword { get; init; }

    /// <summary>
    /// Indicates whether HTTP requests should be redirected to HTTPS.
    /// </summary>
    public required bool HttpsRedirectHttpToHttps { get; init; }

    /// <summary>
    /// The HTTPS port to use.
    /// </summary>
    public required int? HttpsPort { get; init; }

    /// <summary>
    /// Indicates whether HSTS is enabled.
    /// </summary>
    public required bool HttpsEnableHsts { get; init; }

    /// <summary>
    /// The max age for HSTS in seconds.
    /// </summary>
    public required int HttpsHstsMaxAgeSeconds { get; init; }

    /// <summary>
    /// Indicates whether HSTS should include subdomains.
    /// </summary>
    public required bool HttpsHstsIncludeSubDomains { get; init; }

    public static ServicePulseHostSettings GetFromEnvironmentVariables()
    {
        var enableReverseProxyValue = Environment.GetEnvironmentVariable("ENABLE_REVERSE_PROXY");

        if (!bool.TryParse(enableReverseProxyValue, out var enableReverseProxy))
        {
            enableReverseProxy = true;
        }

        var forwardedHeadersEnabled = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_FORWARDEDHEADERS_ENABLED"),
            defaultValue: true);

        var forwardedHeadersTrustAllProxies = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES"),
            defaultValue: true);

        var forwardedHeadersKnownProxies = ParseIpAddresses(
            Environment.GetEnvironmentVariable("SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES"));
        var forwardedHeadersKnownNetworks = ParseNetworks(
            Environment.GetEnvironmentVariable("SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS"));

        // If specific proxies or networks are configured, disable trust all proxies
        if (forwardedHeadersKnownProxies.Count > 0 || forwardedHeadersKnownNetworks.Count > 0)
        {
            forwardedHeadersTrustAllProxies = false;
        }

        // HTTPS settings
        var httpsEnabled = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_ENABLED"),
            defaultValue: false);

        var httpsCertificatePath = Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_CERTIFICATEPATH");

        var httpsCertificatePassword = Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD");

        var httpsRedirectHttpToHttps = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS"),
            defaultValue: false);

        var httpsPort = ParseNullableInt(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_PORT"));

        var httpsEnableHsts = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_ENABLEHSTS"),
            defaultValue: false);

        var httpsHstsMaxAgeSeconds = ParseInt(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS"),
            defaultValue: 31536000); // 1 year

        var httpsHstsIncludeSubDomains = ParseBool(
            Environment.GetEnvironmentVariable("SERVICEPULSE_HTTPS_HSTSINCLUDESUBDOMAINS"),
            defaultValue: false);

        var settings = new ServicePulseHostSettings
        {
            EnableReverseProxy = enableReverseProxy,
            ForwardedHeadersEnabled = forwardedHeadersEnabled,
            ForwardedHeadersTrustAllProxies = forwardedHeadersTrustAllProxies,
            ForwardedHeadersKnownProxies = forwardedHeadersKnownProxies,
            ForwardedHeadersKnownNetworks = forwardedHeadersKnownNetworks,
            HttpsEnabled = httpsEnabled,
            HttpsCertificatePath = httpsCertificatePath,
            HttpsCertificatePassword = httpsCertificatePassword,
            HttpsRedirectHttpToHttps = httpsRedirectHttpToHttps,
            HttpsPort = httpsPort,
            HttpsEnableHsts = httpsEnableHsts,
            HttpsHstsMaxAgeSeconds = httpsHstsMaxAgeSeconds,
            HttpsHstsIncludeSubDomains = httpsHstsIncludeSubDomains
        };

        settings.LogForwardedHeadersConfiguration();
        settings.ValidateHttpsCertificateConfiguration();
        settings.LogHttpsConfiguration();


        return settings;
    }

    static bool ParseBool(string? value, bool defaultValue)
    {
        if (bool.TryParse(value, out var result))
        {
            return result;
        }
        return defaultValue;
    }

    static int ParseInt(string? value, int defaultValue)
    {
        if (int.TryParse(value, out var result))
        {
            return result;
        }
        return defaultValue;
    }

    static int? ParseNullableInt(string? value)
    {
        if (int.TryParse(value, out var result))
        {
            return result;
        }
        return null;
    }

    static IReadOnlyList<IPAddress> ParseIpAddresses(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return [];
        }

        var addresses = new List<IPAddress>();
        var parts = value.Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var part in parts)
        {
            if (IPAddress.TryParse(part, out var address))
            {
                addresses.Add(address);
            }
        }

        return addresses;
    }

    static IReadOnlyList<IPNetwork> ParseNetworks(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return [];
        }

        var networks = new List<IPNetwork>();
        var parts = value.Split([',', ';'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var part in parts)
        {
            if (IPNetwork.TryParse(part, out var network))
            {
                networks.Add(network);
            }
        }

        return networks;
    }

    /// <summary>
    /// Logs the forwarded headers configuration and warns about potential misconfigurations.
    /// </summary>
    void LogForwardedHeadersConfiguration()
    {
        var hasProxyConfig = ForwardedHeadersKnownProxies.Count > 0 || ForwardedHeadersKnownNetworks.Count > 0;
        var knownProxiesDisplay = ForwardedHeadersKnownProxies.Count > 0
            ? string.Join(", ", ForwardedHeadersKnownProxies)
            : "(none)";
        var knownNetworksDisplay = ForwardedHeadersKnownNetworks.Count > 0
            ? string.Join(", ", ForwardedHeadersKnownNetworks)
            : "(none)";

        logger.LogInformation("Forwarded headers settings: Enabled={Enabled}, TrustAllProxies={TrustAllProxies}, KnownProxies={KnownProxies}, KnownNetworks={KnownNetworks}",
            ForwardedHeadersEnabled, ForwardedHeadersTrustAllProxies, knownProxiesDisplay, knownNetworksDisplay);

        // Warn about potential misconfigurations
        if (!ForwardedHeadersEnabled && hasProxyConfig)
        {
            logger.LogWarning("Forwarded headers processing is disabled but proxy configuration is present. SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES and SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS settings will be ignored");
        }

        if (ForwardedHeadersEnabled && ForwardedHeadersTrustAllProxies)
        {
            logger.LogWarning("Forwarded headers is configured to trust all proxies. Any client can spoof X-Forwarded-* headers. Consider configuring SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES or SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS for production environments");
        }

        if (!ForwardedHeadersEnabled && ForwardedHeadersTrustAllProxies)
        {
            logger.LogWarning("Forwarded headers is disabled but TrustAllProxies is true. SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES setting will be ignored");
        }

        if (ForwardedHeadersEnabled && !ForwardedHeadersTrustAllProxies && !hasProxyConfig)
        {
            logger.LogWarning("Forwarded headers is enabled but no trusted proxies are configured. X-Forwarded-* headers will not be processed");
        }

        if (ForwardedHeadersEnabled && ForwardedHeadersKnownProxies.Count > 0 && ForwardedHeadersKnownNetworks.Count > 0)
        {
            logger.LogInformation("Forwarded headers has both KnownProxies and KnownNetworks configured. Both settings will be used to determine trusted proxies");
        }
    }

    /// <summary>
    /// Validates the HTTPS certificate configuration when HTTPS is enabled.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown when HTTPS is enabled but the certificate path is not set or the file does not exist.</exception>
    void ValidateHttpsCertificateConfiguration()
    {
        if (!HttpsEnabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(HttpsCertificatePath))
        {
            var message = "SERVICEPULSE_HTTPS_CERTIFICATEPATH is required when HTTPS is enabled. Please specify the path to a valid HTTPS certificate file (.pfx or .pem)";
            logger.LogCritical(message);
            throw new InvalidOperationException(message);
        }

        if (!File.Exists(HttpsCertificatePath))
        {
            var message = $"SERVICEPULSE_HTTPS_CERTIFICATEPATH does not exist. Current value: '{HttpsCertificatePath}'";
            logger.LogCritical(message);
            throw new InvalidOperationException(message);
        }
    }

    /// <summary>
    /// Logs the HTTPS configuration and warns about potential misconfigurations.
    /// </summary>
    void LogHttpsConfiguration()
    {
        var httpsPortDisplay = HttpsPort.HasValue ? HttpsPort.Value.ToString() : "(null)";

        logger.LogInformation("HTTPS settings: Enabled={Enabled}, CertificatePath={CertificatePath}, HasCertificatePassword={HasCertificatePassword}, RedirectHttpToHttps={RedirectHttpToHttps}, HttpsPort={HttpsPort}, EnableHsts={EnableHsts}, HstsMaxAgeSeconds={HstsMaxAgeSeconds}, HstsIncludeSubDomains={HstsIncludeSubDomains}",
            HttpsEnabled, HttpsCertificatePath, !string.IsNullOrEmpty(HttpsCertificatePassword), HttpsRedirectHttpToHttps, httpsPortDisplay, HttpsEnableHsts, HttpsHstsMaxAgeSeconds, HttpsHstsIncludeSubDomains);

        if (HttpsEnabled && EnableReverseProxy)
        {
            logger.LogInformation("HTTPS is enabled with reverse proxy. Backend connections to ServiceControl and Monitoring will be upgraded to HTTPS");
        }

        if (HttpsEnabled && !EnableReverseProxy)
        {
            logger.LogInformation("HTTPS is enabled without reverse proxy. ServiceControl and Monitoring URLs will be upgraded to HTTPS");
        }

        // Warn about potential misconfigurations
        if (!HttpsEnabled)
        {
            logger.LogWarning("Kestrel HTTPS is disabled. Local communication will not be encrypted unless TLS is terminated by a reverse proxy");
        }

        if (!HttpsEnabled && (!string.IsNullOrEmpty(HttpsCertificatePath) || !string.IsNullOrEmpty(HttpsCertificatePassword)))
        {
            logger.LogWarning("HTTPS is disabled but certificate settings are provided. SERVICEPULSE_HTTPS_CERTIFICATEPATH and SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD will be ignored");
        }

        if (HttpsRedirectHttpToHttps && !HttpsEnableHsts)
        {
            logger.LogWarning("HTTPS redirect is enabled but HSTS is disabled. Consider enabling SERVICEPULSE_HTTPS_ENABLEHSTS for better security");
        }

        if (!HttpsEnabled && HttpsEnableHsts)
        {
            logger.LogWarning("HSTS is enabled but Kestrel HTTPS is disabled. HSTS headers will only be effective if TLS is terminated by a reverse proxy");
        }

        if (!HttpsEnabled && HttpsRedirectHttpToHttps)
        {
            logger.LogWarning("HTTPS redirect is enabled but Kestrel HTTPS is disabled. Redirect will only work if TLS is terminated by a reverse proxy");
        }

        if (HttpsPort.HasValue && !HttpsRedirectHttpToHttps)
        {
            logger.LogWarning("SERVICEPULSE_HTTPS_PORT is configured but HTTPS redirect is disabled. The port setting will be ignored");
        }

        if (HttpsRedirectHttpToHttps && !HttpsPort.HasValue)
        {
            logger.LogInformation("SERVICEPULSE_HTTPS_PORT is not configured. HTTPS redirect will be ignored");
        }
    }

    public void UpdateApplicationSettings(ref ServicePulseSettings settings)
    {
        // When HTTPS is enabled on ServicePulse, assume ServiceControl (and Monitoring, if configured) also uses HTTPS
        if (HttpsEnabled)
        {
            settings = settings with
            {
                ServiceControlUrl = UpgradeToHttps(settings.ServiceControlUrl),
                MonitoringUrl = settings.MonitoringUrl is not null
                    ? UpgradeToHttps(settings.MonitoringUrl)
                    : null
            };
        }
    }

    static string UpgradeToHttps(string url)
    {
        var uri = new Uri(url);

        if (uri.Scheme == Uri.UriSchemeHttps)
        {
            return url;
        }

        var builder = new UriBuilder(uri)
        {
            Scheme = Uri.UriSchemeHttps,
            Port = uri.IsDefaultPort ? -1 : uri.Port
        };

        return builder.Uri.ToString();
    }
}
