namespace ServicePulse;

using System.Reflection;

class ConstantsFile
{
    public static string GetContent(Settings settings)
    {
        var version = GetVersionInformation();

        string serviceControlUrl;
        string monitoringUrl;

        if (settings.EnableReverseProxy)
        {
            serviceControlUrl = "/api/";
            monitoringUrl = settings.MonitoringUri == null ? "!" : "/monitoring-api/";
        }
        else
        {
            // When HTTPS is enabled, upgrade backend URLs to HTTPS
            var scUri = settings.HttpsEnabled
                ? UpgradeToHttps(settings.ServiceControlUri)
                : settings.ServiceControlUri;
            serviceControlUrl = scUri.ToString();

            if (settings.MonitoringUri != null)
            {
                var mUri = settings.HttpsEnabled
                    ? UpgradeToHttps(settings.MonitoringUri)
                    : settings.MonitoringUri;
                monitoringUrl = mUri.ToString();
            }
            else
            {
                monitoringUrl = "!";
            }
        }

        var constantsFile = $$"""
window.defaultConfig = {
  default_route: '{{settings.DefaultRoute}}',
  version: '{{version}}',
  service_control_url: '{{serviceControlUrl}}',
  monitoring_urls: ['{{monitoringUrl}}'],
  showPendingRetry: {{(settings.ShowPendingRetry ? "true" : "false")}},
}
""";

        return constantsFile;
    }

    static string GetVersionInformation()
    {
        var majorMinorPatch = "0.0.0";

        var attributes = Assembly.GetExecutingAssembly().GetCustomAttributes<AssemblyMetadataAttribute>();

        foreach (var attribute in attributes)
        {
            if (attribute.Key == "MajorMinorPatch")
            {
                majorMinorPatch = attribute.Value ?? "0.0.0";
            }
        }

        return majorMinorPatch;
    }

    static Uri UpgradeToHttps(Uri uri)
    {
        if (uri.Scheme == Uri.UriSchemeHttps)
        {
            return uri;
        }

        var builder = new UriBuilder(uri)
        {
            Scheme = Uri.UriSchemeHttps,
            Port = uri.IsDefaultPort ? -1 : uri.Port
        };

        return builder.Uri;
    }
}
