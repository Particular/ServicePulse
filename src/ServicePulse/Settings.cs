namespace ServicePulse;

using System.Net;
using System.Text.Json;
using IPNetwork = Microsoft.AspNetCore.HttpOverrides.IPNetwork;

class Settings
{
    public required Uri ServiceControlUri { get; init; }

    public required Uri? MonitoringUri { get; init; }

    public required string DefaultRoute { get; init; }

    public required bool ShowPendingRetry { get; init; }

    public required bool EnableReverseProxy { get; init; }

    public required bool ForwardedHeadersEnabled { get; init; }

    public required bool ForwardedHeadersTrustAllProxies { get; init; }

    public required IReadOnlyList<IPAddress> ForwardedHeadersKnownProxies { get; init; }

    public required IReadOnlyList<IPNetwork> ForwardedHeadersKnownNetworks { get; init; }

    // HTTPS settings
    public required bool HttpsEnabled { get; init; }

    public required string? HttpsCertificatePath { get; init; }

    public required string? HttpsCertificatePassword { get; init; }

    public required bool HttpsRedirectHttpToHttps { get; init; }

    public required int? HttpsPort { get; init; }

    public required bool HttpsEnableHsts { get; init; }

    public required int HttpsHstsMaxAgeSeconds { get; init; }

    public required bool HttpsHstsIncludeSubDomains { get; init; }

    public static Settings GetFromEnvironmentVariables()
    {
        var serviceControlUrl = Environment.GetEnvironmentVariable("SERVICECONTROL_URL") ?? "http://localhost:33333/api/";

        if (!serviceControlUrl.EndsWith("/", StringComparison.Ordinal))
        {
            serviceControlUrl += "/";
        }

        if (!serviceControlUrl.EndsWith("api/", StringComparison.Ordinal))
        {
            serviceControlUrl += "api/";
        }

        var serviceControlUri = new Uri(serviceControlUrl);

        var monitoringUrls = ParseLegacyMonitoringValue(Environment.GetEnvironmentVariable("MONITORING_URLS"));
        var monitoringUrl = Environment.GetEnvironmentVariable("MONITORING_URL");

        monitoringUrl ??= monitoringUrls;
        monitoringUrl ??= "http://localhost:33633/";

        var monitoringUri = monitoringUrl == "!" ? null : new Uri(monitoringUrl);

        var defaultRoute = Environment.GetEnvironmentVariable("DEFAULT_ROUTE") ?? "/dashboard";

        var showPendingRetryValue = Environment.GetEnvironmentVariable("SHOW_PENDING_RETRY");
        bool.TryParse(showPendingRetryValue, out var showPendingRetry);

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

        return new Settings
        {
            ServiceControlUri = serviceControlUri,
            MonitoringUri = monitoringUri,
            DefaultRoute = defaultRoute,
            ShowPendingRetry = showPendingRetry,
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

    static string? ParseLegacyMonitoringValue(string? value)
    {
        if (value is null)
        {
            return null;
        }

        var cleanedValue = value.Replace('\'', '"');
        var json = $$"""{"Addresses":{{cleanedValue}}}""";

        MonitoringUrls? result;

        try
        {
            result = JsonSerializer.Deserialize<MonitoringUrls>(json);
        }
        catch (JsonException)
        {
            return null;
        }

        var addresses = result?.Addresses;

        if (addresses is not null && addresses.Length > 0)
        {
            return addresses[0];
        }

        return null;
    }

    class MonitoringUrls
    {
        public string[] Addresses { get; set; } = [];
    }
}
