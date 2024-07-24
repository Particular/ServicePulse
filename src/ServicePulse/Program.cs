using System.Net.Mime;
using Microsoft.Extensions.FileProviders;

var constantsFile = """
window.defaultConfig = {
  default_route: '/dashboard',
  version: '1.2.0',
  service_control_url: 'http://localhost:33333/api/',
  monitoring_urls: ['http://localhost:33633/'],
  showPendingRetry: false,
}
""";

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
var fileProvider = new CompositeFileProvider(builder.Environment.WebRootFileProvider, manifestEmbeddedFileProvider);

var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
app.UseDefaultFiles(defaultFilesOptions);

var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
app.UseStaticFiles(staticFileOptions);

app.MapGet("/js/app.constants.js", (HttpContext context) =>
{
    context.Response.ContentType = MediaTypeNames.Text.JavaScript;
    return constantsFile;
});

app.Run();
