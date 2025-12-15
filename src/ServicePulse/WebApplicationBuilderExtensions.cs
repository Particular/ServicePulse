namespace ServicePulse;

using System.Security.Cryptography.X509Certificates;

static class WebApplicationBuilderExtensions
{
    public static void ConfigureHttps(this WebApplicationBuilder builder, Settings settings)
    {
        if (!settings.HttpsEnabled)
        {
            return;
        }

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ConfigureEndpointDefaults(listenOptions =>
            {
                if (settings.HttpsEnabled && !string.IsNullOrEmpty(settings.HttpsCertificatePath))
                {
                    listenOptions.UseHttps(LoadCertificate(settings));
                }
            });
        });
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
