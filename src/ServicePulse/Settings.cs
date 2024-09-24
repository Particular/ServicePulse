namespace ServicePulse;

using System.Text.Json;

class Settings
{
    public required Uri ServiceControlUri { get; init; }

    public required Uri MonitoringUri { get; init; }

    public required string DefaultRoute { get; init; }

    public required bool ShowPendingRetry { get; init; }

    public static Settings GetFromEnvironmentVariables()
    {
        var serviceControlUrl = Environment.GetEnvironmentVariable("SERVICECONTROL_URL") ?? "http://localhost:33333";
        var serviceControlUri = new Uri(serviceControlUrl);

        var monitoringUrls = ParseLegacyMonitoringValue(Environment.GetEnvironmentVariable("MONITORING_URLS"));
        var monitoringUrl = Environment.GetEnvironmentVariable("MONITORING_URL");

        monitoringUrl ??= monitoringUrls;
        monitoringUrl ??= "http://localhost:33633";

        var monitoringUri = new Uri(monitoringUrl);

        var defaultRoute = Environment.GetEnvironmentVariable("DEFAULT_ROUTE") ?? "/dashboard";

        var showPendingRetryValue = Environment.GetEnvironmentVariable("SHOW_PENDING_RETRY");
        bool.TryParse(showPendingRetryValue, out var showPendingRetry);

        return new Settings
        {
            ServiceControlUri = serviceControlUri,
            MonitoringUri = monitoringUri,
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
