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
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ConfigureHttpsDefaults(httpsOptions =>
                {
                    httpsOptions.ServerCertificate = LoadCertificate(settings);
                });
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
}
