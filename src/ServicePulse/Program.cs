using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var hostSettings = ServicePulseHostSettings.GetFromEnvironmentVariables();
var servicePulseSettings = ServicePulseSettings.GetFromEnvironmentVariables();

if (hostSettings.EnableReverseProxy)
{
    builder.Services.AddServicePulseReverseProxy(ref servicePulseSettings);
}

var app = builder.Build();

app.UseServicePulse(builder.Environment.ContentRootFileProvider);

if (hostSettings.EnableReverseProxy)
{
    app.MapReverseProxy();
}

app.MapServicePulseConstants(servicePulseSettings);

app.Run();
