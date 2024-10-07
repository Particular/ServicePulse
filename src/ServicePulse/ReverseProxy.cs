namespace ServicePulse;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

static class ReverseProxy
{
    public static (List<RouteConfig> routes, List<ClusterConfig> clusters) GetConfiguration(Settings settings)
    {
        var serviceControlInstance = new ClusterConfig
        {
            ClusterId = "serviceControlInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = settings.ServiceControlUri.ToString() } }
            }
        };

        var monitoringInstance = new ClusterConfig
        {
            ClusterId = "monitoringInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = settings.MonitoringUri.ToString() } }
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
        }.WithTransformPathRemovePrefix("/api");

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
}
