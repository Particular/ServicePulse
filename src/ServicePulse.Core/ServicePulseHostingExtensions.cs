using System.Net.Mime;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using ServicePulse;

public static class ServicePulseHostingExtensions
{
    public static void UseServicePulse(this WebApplication app, Settings settings, IFileProvider overrideFileProvider)
    {
        var manifestEmbeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(ServicePulseHostingExtensions).Assembly, "wwwroot");
        var fileProvider = new CompositeFileProvider(overrideFileProvider, manifestEmbeddedFileProvider);

        var defaultFilesOptions = new DefaultFilesOptions { FileProvider = fileProvider };
        app.UseDefaultFiles(defaultFilesOptions);

        var staticFileOptions = new StaticFileOptions { FileProvider = fileProvider };
        app.UseStaticFiles(staticFileOptions);

        var constantsFile = ConstantsFile.GetContent(settings);

        app.MapGet("/js/app.constants.js", (HttpContext context) =>
        {
            context.Response.ContentType = MediaTypeNames.Text.JavaScript;
            return constantsFile;
        });
    }
}
