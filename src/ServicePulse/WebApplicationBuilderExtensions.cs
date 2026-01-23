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

            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ConfigureHttpsDefaults(httpsOptions =>
                {
                    httpsOptions.ServerCertificate = certificate;
                });
            });

            // Change URL scheme to HTTPS when HTTPS is enabled.
            // If ASPNETCORE_URLS is set, convert http:// to https://.
            // Otherwise, use a default HTTPS URL.
            var configuredUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
            if (!string.IsNullOrEmpty(configuredUrls))
            {
                var httpsUrls = configuredUrls.Replace("http://", "https://");
                builder.WebHost.UseUrls(httpsUrls);
            }
            else
            {
                builder.WebHost.UseUrls("https://*:5291");
            }
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
}
