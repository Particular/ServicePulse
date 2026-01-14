namespace ServicePulse;

using System.Net.Mime;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.FileProviders;

public static class ServicePulseExtensions
{
    public static IApplicationBuilder UseServicePulse(this IApplicationBuilder app)
    {
        var embeddedFileProvider = new ManifestEmbeddedFileProvider(typeof(ServicePulseExtensions).Assembly, "wwwroot");

        return app
            .UseDefaultFiles(new DefaultFilesOptions
            {
                FileProvider = embeddedFileProvider
            })
            .UseStaticFiles(new StaticFileOptions
            {
                FileProvider = embeddedFileProvider
            });

    }

    public static IEndpointRouteBuilder MapServicePulseConstants(this IEndpointRouteBuilder app, Settings settings)
    {
        var constantsFile = ConstantsFile.GetContent(settings);

        app.MapGet("/js/app.constants.js", (HttpContext context) =>
        {
            context.Response.ContentType = MediaTypeNames.Text.JavaScript;
            return constantsFile;
        });


        return app;
    }
}