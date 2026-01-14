namespace ServicePulse;

using System.Net.Mime;
using System.Reflection;
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

    public static IEndpointRouteBuilder MapServicePulseConstants(this IEndpointRouteBuilder app, ServicePulseSettings settings)
    {
        var constantsFile = GetConstantsFileContents(settings);

        app.MapGet("/js/app.constants.js", (HttpContext context) =>
        {
            context.Response.ContentType = MediaTypeNames.Text.JavaScript;
            return constantsFile;
        });

        return app;
    }

    static string GetConstantsFileContents(ServicePulseSettings settings)
    => $$"""
        window.defaultConfig = {
            default_route: '{{settings.DefaultRoute}}',
            version: '{{GetVersionInformation()}}',
            service_control_url: '{{settings.ServiceControlUrl}}',
            monitoring_urls: ['{{settings.MonitoringUrl ?? "!"}}'],
            showPendingRetry: {{(settings.ShowPendingRetry ? "true" : "false")}},
        }
        """;
    static string GetVersionInformation()
    {
        var majorMinorPatch = "0.0.0";

        var attributes = typeof(ServicePulseExtensions).Assembly.GetCustomAttributes<AssemblyMetadataAttribute>();

        foreach (var attribute in attributes)
        {
            if (attribute.Key == "MajorMinorPatch")
            {
                majorMinorPatch = attribute.Value ?? "0.0.0";
            }
        }

        return majorMinorPatch;
    }
}