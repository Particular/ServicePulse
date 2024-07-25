using System.Net.Mime;
using System.Reflection;
using System.Text.Json;
using Microsoft.Extensions.FileProviders;
using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

var builder = WebApplication.CreateBuilder(args);

var (routes, clusters) = GetReverseProxyConfiguration();
builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);

var app = builder.Build();

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

app.MapReverseProxy();

var constantsFile = GetConstantsFile();

app.MapGet("/js/app.constants.js", (HttpContext context) =>
{
    context.Response.ContentType = MediaTypeNames.Text.JavaScript;
    return constantsFile;
});

app.Run();

static string GetConstantsFile()
{
    var defaultRoute = Environment.GetEnvironmentVariable("DEFAULT_ROUTE") ?? "/dashboard";
    var version = GetVersionInformation();
    var showPendingRetry = Environment.GetEnvironmentVariable("SHOW_PENDING_RETRY") ?? "false";

    var constantsFile = $$"""
window.defaultConfig = {
  default_route: '{{defaultRoute}}',
  version: '{{version}}',
  service_control_url: '/api/',
  monitoring_urls: ['/monitoring-api/'],
  showPendingRetry: {{showPendingRetry}},
}
""";

    return constantsFile;
}

static string GetVersionInformation()
{
    var majorMinorPatch = "0.0.0";

    var attributes = Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>();

    foreach (var attribute in attributes)
    {
        if (attribute.Key == "MajorMinorPatch")
        {
            majorMinorPatch = attribute.Value ?? "0.0.0";
        }
    }

    return majorMinorPatch;
}

static (List<RouteConfig> routes, List<ClusterConfig> clusters) GetReverseProxyConfiguration()
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

    MonitoringUrls? result = null;

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
