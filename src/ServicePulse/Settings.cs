namespace ServicePulse;

using System.Text.Json;

record Settings
{
    public required string ServiceControlUrl { get; init; }

    public required string? MonitoringUrl { get; init; }

    public required string DefaultRoute { get; init; }

    public required bool ShowPendingRetry { get; init; }

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

        return new Settings
        {
            ServiceControlUrl = serviceControlUri.ToString(),
            MonitoringUrl = monitoringUri?.ToString(),
            DefaultRoute = defaultRoute,
            ShowPendingRetry = showPendingRetry
        };
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
