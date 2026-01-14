using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var settings = Settings.GetFromEnvironmentVariables();

if (settings.EnableReverseProxy)
{
    var (routes, clusters) = ReverseProxy.GetConfiguration(settings);
    builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);
}

var app = builder.Build();

app.UseServicePulse(builder.Environment.ContentRootFileProvider);

if (settings.EnableReverseProxy)
{
    app.MapReverseProxy();
}

app.MapServicePulseConstants(settings);

app.Run();
