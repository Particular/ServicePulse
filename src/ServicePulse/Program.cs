using System.Net.Mime;
using Microsoft.Extensions.FileProviders;
using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var settings = Settings.GetFromEnvironmentVariables();

var (routes, clusters) = ReverseProxy.GetConfiguration(settings);
builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);

var app = builder.Build();

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

app.MapReverseProxy();

var constantsFile = ConstantsFile.GetContent(settings);

app.MapGet("/js/app.constants.js", (HttpContext context) =>
{
    context.Response.ContentType = MediaTypeNames.Text.JavaScript;
    return constantsFile;
});

app.Run();
