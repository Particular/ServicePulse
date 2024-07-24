using System.Net.Mime;
using System.Reflection;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

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
    var serviceControlUrl = Environment.GetEnvironmentVariable("SERVICECONTROL_URL") ?? "http://localhost:33333/api/";
    var monitoringUrls = Environment.GetEnvironmentVariable("MONITORING_URLS") ?? "['http://localhost:33633/']";
    var showPendingRetry = Environment.GetEnvironmentVariable("SHOW_PENDING_RETRY") ?? "false";

    var constantsFile = $$"""
window.defaultConfig = {
  default_route: '{{defaultRoute}}',
  version: '{{version}}',
  service_control_url: '{{serviceControlUrl}}',
  monitoring_urls: {{monitoringUrls}},
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
