namespace ServicePulse;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

static class ReverseProxy
{
    public static (List<RouteConfig> routes, List<ClusterConfig> clusters) GetConfiguration(Settings settings)
    {
        var routes = new List<RouteConfig>();
        var clusters = new List<ClusterConfig>();

        // When HTTPS is enabled on ServicePulse, assume ServiceControl also uses HTTPS
        var serviceControlUri = settings.HttpsEnabled
            ? UpgradeToHttps(settings.ServiceControlUri)
            : settings.ServiceControlUri;

        var serviceControlInstance = new ClusterConfig
        {
            ClusterId = "serviceControlInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = serviceControlUri.ToString() } }
            }
        };
        var serviceControlRoute = new RouteConfig
        {
            RouteId = "serviceControlRoute",
            ClusterId = nameof(serviceControlInstance),
            Match = new RouteMatch
            {
                Path = "/api/{**catch-all}"
            }
        }.WithTransformPathRemovePrefix("/api");

        clusters.Add(serviceControlInstance);
        routes.Add(serviceControlRoute);

        if (settings.MonitoringUri != null)
        {
            // When HTTPS is enabled on ServicePulse, assume Monitoring also uses HTTPS
            var monitoringUri = settings.HttpsEnabled
                ? UpgradeToHttps(settings.MonitoringUri)
                : settings.MonitoringUri;

            var monitoringInstance = new ClusterConfig
            {
                ClusterId = "monitoringInstance",
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    { "instance", new DestinationConfig { Address = monitoringUri.ToString() } }
                }
            };

            var monitoringRoute = new RouteConfig
            {
                RouteId = "monitoringRoute",
                ClusterId = nameof(monitoringInstance),
                Match = new RouteMatch { Path = "/monitoring-api/{**catch-all}" }
            }.WithTransformPathRemovePrefix("/monitoring-api");

            clusters.Add(monitoringInstance);
            routes.Add(monitoringRoute);
        }

        return (routes, clusters);
    }

    static Uri UpgradeToHttps(Uri uri)
    {
        if (uri.Scheme == Uri.UriSchemeHttps)
        {
            return uri;
        }

        var builder = new UriBuilder(uri)
        {
            Scheme = Uri.UriSchemeHttps,
            Port = uri.IsDefaultPort ? -1 : uri.Port
        };

        return builder.Uri;
    }
}
