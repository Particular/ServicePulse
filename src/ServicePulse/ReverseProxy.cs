namespace ServicePulse;

using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

static class ReverseProxy
{
    public static void AddServicePulseReverseProxy(this IServiceCollection services, ref ServicePulseSettings settings)
    {
        var routes = new List<RouteConfig>();
        var clusters = new List<ClusterConfig>();

        AddServiceControl(ref settings, routes, clusters);
        AddMonitoringIfEnabled(ref settings, routes, clusters);

        services.AddReverseProxy().LoadFromMemory(routes, clusters);
    }

    static void AddServiceControl(ref ServicePulseSettings settings, List<RouteConfig> routes, List<ClusterConfig> clusters)
    {
        var serviceControlInstance = new ClusterConfig
        {
            ClusterId = "serviceControlInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = settings.ServiceControlUrl } }
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

        settings = settings with
        {
            ServiceControlUrl = "/api/"
        };
    }

    static void AddMonitoringIfEnabled(ref ServicePulseSettings settings, List<RouteConfig> routes, List<ClusterConfig> clusters)
    {
        if (settings.MonitoringUrl is null)
        {
            return;
        }

        var monitoringInstance = new ClusterConfig
        {
            ClusterId = "monitoringInstance",
            Destinations = new Dictionary<string, DestinationConfig>
            {
                { "instance", new DestinationConfig { Address = settings.MonitoringUrl } }
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
        settings = settings with
        {
            MonitoringUrl = "/monitoring-api/"
        };
    }

}
