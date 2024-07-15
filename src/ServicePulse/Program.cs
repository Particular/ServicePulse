using Microsoft.Extensions.FileProviders;
using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

var serviceControlInstance = new ClusterConfig
{
    ClusterId = "serviceControlInstance",
    Destinations = new Dictionary<string, DestinationConfig>
    {
        { "instance", new DestinationConfig { Address = "http://localhost:33333" } }
    }
};

var monitoringInstance = new ClusterConfig
{
    ClusterId = "monitoringInstance",
    Destinations = new Dictionary<string, DestinationConfig>
    {
        { "instance", new DestinationConfig { Address = "http://localhost:33633/" } }
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

builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);

var app = builder.Build();

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

app.MapReverseProxy();

app.Run();
