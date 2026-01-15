using System.Net.Mime;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using ServicePulse;

/// <summary>
/// Extensions for hosting ServicePulse within a WebApplication.
/// </summary>
public static class ServicePulseHostingExtensions
{
    /// <summary>
    /// Adds ServicePulse static file serving and configuration endpoint to the WebApplication.
    /// </summary>
    public static void UseServicePulse(this WebApplication app, ServicePulseSettings settings, IFileProvider overrideFileProvider)
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
