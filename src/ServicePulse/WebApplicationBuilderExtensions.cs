namespace ServicePulse;

using System.Security.Cryptography.X509Certificates;

static class WebApplicationBuilderExtensions
{
    public static void ConfigureHttps(this WebApplicationBuilder builder, Settings settings)
    {
        // EnableHsts is disabled by default
        // Hsts is automatically disabled in Development environments
        if (settings.HttpsEnableHsts)
        {
            builder.Services.AddHsts(options =>
            {
                options.MaxAge = TimeSpan.FromSeconds(settings.HttpsHstsMaxAgeSeconds);
                options.IncludeSubDomains = settings.HttpsHstsIncludeSubDomains;
            });
        }

        // RedirectHttpToHttps is disabled by default. HttpsPort is null by default.
        if (settings.HttpsRedirectHttpToHttps && settings.HttpsPort.HasValue)
        {
            builder.Services.AddHttpsRedirection(options =>
            {
                options.HttpsPort = settings.HttpsPort.Value;
            });
        }

        // Kestrel HTTPS is disabled by default
        if (settings.HttpsEnabled)
        {
            var certificate = LoadCertificate(settings);

            // Parse configured URLs and set up HTTPS endpoints explicitly
            var configuredUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
            var endpoints = ParseEndpoints(configuredUrls);

            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                foreach (var endpoint in endpoints)
                {
                    serverOptions.ListenAnyIP(endpoint.Port, listenOptions =>
                    {
                        listenOptions.UseHttps(certificate);
                    });
                }
            });
        }
    }

    static X509Certificate2 LoadCertificate(Settings settings)
    {
        var certPath = settings.HttpsCertificatePath
            ?? throw new InvalidOperationException("HTTPS is enabled but HTTPS_CERTIFICATEPATH is not set.");

        if (!File.Exists(certPath))
        {
            throw new FileNotFoundException($"Certificate file not found: {certPath}");
        }

        return string.IsNullOrEmpty(settings.HttpsCertificatePassword)
            ? new X509Certificate2(certPath)
            : new X509Certificate2(certPath, settings.HttpsCertificatePassword);
    }

    static List<EndpointConfig> ParseEndpoints(string? configuredUrls)
    {
        var endpoints = new List<EndpointConfig>();

        if (string.IsNullOrEmpty(configuredUrls))
        {
            // Default to port 443 for HTTPS
            endpoints.Add(new EndpointConfig(443));
            return endpoints;
        }

        // ASPNETCORE_URLS can contain multiple URLs separated by semicolons
        var urls = configuredUrls.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var url in urls)
        {
            if (TryParsePort(url, out var port))
            {
                endpoints.Add(new EndpointConfig(port));
            }
        }

        // Fall back to default if no valid URLs were parsed
        if (endpoints.Count == 0)
        {
            endpoints.Add(new EndpointConfig(443));
        }

        return endpoints;
    }

    static bool TryParsePort(string url, out int port)
    {
        port = 0;

        // Handle formats like:
        // http://+:5000, http://*:5000, http://0.0.0.0:5000
        // http://[::]:5000, http://localhost:5000
        var colonIndex = url.LastIndexOf(':');
        if (colonIndex == -1)
        {
            return false;
        }

        var portPart = url[(colonIndex + 1)..];

        // Remove any trailing path
        var slashIndex = portPart.IndexOf('/');
        if (slashIndex != -1)
        {
            portPart = portPart[..slashIndex];
        }

        return int.TryParse(portPart, out port) && port > 0 && port <= 65535;
    }

    record EndpointConfig(int Port);
}
