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
            monitoringUrl = "/monitoring-api/";
        }
        else
        {
            serviceControlUrl = settings.ServiceControlUri.ToString();
            monitoringUrl = settings.MonitoringUri.ToString();
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
}
