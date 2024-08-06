namespace ServicePulse;

using System.Text.Json;
using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

static class ReverseProxy
{
    public static (List<RouteConfig> routes, List<ClusterConfig> clusters) GetConfiguration()
    {
        var serviceControlUrl = Environment.GetEnvironmentVariable("SERVICECONTROL_URL") ?? "http://localhost:33333";
        var serviceControlUri = new Uri(serviceControlUrl);

        var monitoringUrls = ParseLegacyMonitoringValue(Environment.GetEnvironmentVariable("MONITORING_URLS"));
        var monitoringUrl = Environment.GetEnvironmentVariable("MONITORING_URL");

        monitoringUrl ??= monitoringUrls;
        monitoringUrl ??= "http://localhost:33633";

        var monitoringUri = new Uri(monitoringUrl);

        var serviceControlInstance = new ClusterConfig
        {
            ClusterId = "serviceControlInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = serviceControlUri.GetLeftPart(UriPartial.Authority) } }
            }
        };

        var monitoringInstance = new ClusterConfig
        {
            ClusterId = "monitoringInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = monitoringUri.GetLeftPart(UriPartial.Authority) } }
            }
        };

        var serviceControlRoute = new RouteConfig()
        {
            RouteId = "serviceControlRoute",
            ClusterId = nameof(serviceControlInstance),
            Match = new RouteMatch
            {
                Path = "/api/{**catch-all}"
            }
        };

        var monitoringRoute = new RouteConfig()
        {
            RouteId = "monitoringRoute",
            ClusterId = nameof(monitoringInstance),
            Match = new RouteMatch
            {
                Path = "/monitoring-api/{**catch-all}"
            }
        }.WithTransformPathRemovePrefix("/monitoring-api");

        var routes = new List<RouteConfig>
        {
            serviceControlRoute,
            monitoringRoute
        };

        var clusters = new List<ClusterConfig>
        {
            serviceControlInstance,
            monitoringInstance
        };

        return (routes, clusters);
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
