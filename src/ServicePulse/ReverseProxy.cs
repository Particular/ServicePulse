namespace ServicePulse;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

static class ReverseProxy
{
    public static (List<RouteConfig> routes, List<ClusterConfig> clusters) GetConfiguration(Settings settings)
    {
        var routes = new List<RouteConfig>();
        var clusters = new List<ClusterConfig>();

        var serviceControlInstance = new ClusterConfig
        {
            ClusterId = "serviceControlInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = settings.ServiceControlUri.ToString() } }
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
            var monitoringInstance = new ClusterConfig
            {
                ClusterId = "monitoringInstance",
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    { "instance", new DestinationConfig { Address = settings.MonitoringUri.ToString() } }
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
}
