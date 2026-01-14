using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var hostSettings = ServicePulseHostSettings.GetFromEnvironmentVariables();
var servicePulseSettings = ServicePulseSettings.GetFromEnvironmentVariables();

if (hostSettings.EnableReverseProxy)
{
    var (routes, clusters) = ReverseProxy.GetConfiguration(servicePulseSettings);
    builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);
    servicePulseSettings = servicePulseSettings with
    {
        ServiceControlUrl = "/api/",
        MonitoringUrl = servicePulseSettings.MonitoringUrl is not null
            ? "/monitoring-api/"
            : null
    };
}

var app = builder.Build();

app.UseServicePulse(builder.Environment.ContentRootFileProvider);

if (hostSettings.EnableReverseProxy)
{
    app.MapReverseProxy();
}

app.MapServicePulseConstants(servicePulseSettings);

app.Run();
