using System.Net.Mime;
using Microsoft.Extensions.FileProviders;
using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var settings = Settings.GetFromEnvironmentVariables();
var hostSettings = ServicePulseHostSettings.GetFromEnvironmentVariables();

hostSettings.UpdateApplicationSettings(ref settings);

// Configure Kestrel for HTTPS if enabled
builder.ConfigureHttps(hostSettings);

if (hostSettings.EnableReverseProxy)
{
    var (routes, clusters) = ReverseProxy.GetConfiguration(ref settings);
    builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);
}

var app = builder.Build();

// Forwarded headers must be first in the pipeline for correct scheme/host detection
app.UseForwardedHeaders(hostSettings);

// HTTPS middleware (HSTS and redirect)
app.UseHttpsConfiguration(hostSettings);

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

if (hostSettings.EnableReverseProxy)
{
    app.MapReverseProxy();
}

var constantsFile = ConstantsFile.GetContent(settings);

app.MapGet("/js/app.constants.js", (HttpContext context) =>
{
    context.Response.ContentType = MediaTypeNames.Text.JavaScript;
    return constantsFile;
});

app.Run();

// Make Program class accessible for WebApplicationFactory in tests
#pragma warning disable CS1591 // Missing XML comment for publicly visible type or member
public partial class Program { }
#pragma warning restore CS1591 // Missing XML comment for publicly visible type or member
