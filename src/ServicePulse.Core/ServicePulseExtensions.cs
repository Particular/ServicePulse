namespace ServicePulse;

using System.Net.Mime;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.FileProviders;

public static class ServicePulseExtensions
{
    public static IApplicationBuilder UseServicePulse(this IApplicationBuilder app, IFileProvider? overrideFileProvider = null)
    {
        var embeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(ServicePulseExtensions).Assembly, "wwwroot");

        IFileProvider fileProvider = overrideFileProvider is null
            ? embeddedFileProvider
            : new CompositeFileProvider(overrideFileProvider, embeddedFileProvider);

        return app
            .UseDefaultFiles(new DefaultFilesOptions
            {
                FileProvider = fileProvider
            })
            .UseStaticFiles(new StaticFileOptions
            {
                FileProvider = fileProvider
            });
    }

    public static IEndpointRouteBuilder MapServicePulseConstants(this IEndpointRouteBuilder app, ServicePulseSettings constants)
    {
        var constantsFile = constants.GetConstantsFileContents();

        app.MapGet("/js/app.constants.js", (HttpContext context) =>
        {
            context.Response.ContentType = MediaTypeNames.Text.JavaScript;
            return constantsFile;
        });

        return app;
    }
}