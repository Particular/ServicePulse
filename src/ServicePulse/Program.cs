using ServicePulse;

var builder = WebApplication.CreateBuilder(args);

var settings = Settings.GetFromEnvironmentVariables();
var hostSettings = ServicePulseHostSettings.GetFromEnvironmentVariables();

// Configure Kestrel for HTTPS if enabled
builder.ConfigureHttps(hostSettings);

// Configure HSTS options
builder.Services.ConfigureHsts(hostSettings);

// Configure HTTPS redirection port (for reverse proxy scenarios)
builder.Services.ConfigureHttpsRedirection(hostSettings);

if (hostSettings.EnableReverseProxy)
{
    var (routes, clusters) = ReverseProxy.GetConfiguration(ref settings);
    builder.Services.AddReverseProxy().LoadFromMemory(routes, clusters);
}

var app = builder.Build();

// Forwarded headers must be first in the pipeline for correct scheme/host detection
app.UseForwardedHeaders(hostSettings);

// HTTPS middleware (HSTS and redirect)
app.UseHttpsConfiguration(hostSettings);

if (hostSettings.EnableReverseProxy)
{
    app.MapReverseProxy();
}

app.UseServicePulse(settings, builder.Environment.WebRootFileProvider);

app.Run();
