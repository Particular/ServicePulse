namespace ServicePulse;

using System.Reflection;

class ConstantsFile
{
    public static string GetContent(ServicePulseSettings settings)
    {
        var version = GetVersionInformation();

        var constantsFile = $$"""
window.defaultConfig = {
  default_route: '{{settings.DefaultRoute}}',
  version: '{{version}}',
  service_control_url: '{{settings.ServiceControlUrl}}',
  monitoring_urls: ['{{settings.MonitoringUrl ?? "!"}}'],
  showPendingRetry: {{settings.ShowPendingRetry.ToString().ToLower()}},
  isEmbedded: {{settings.IsEmbedded.ToString().ToLower()}}
}
""";

        return constantsFile;
    }

    static string GetVersionInformation()
    {
        var majorMinorPatch = "0.0.0";

        var attributes = typeof(ConstantsFile).Assembly.GetCustomAttributes<AssemblyMetadataAttribute>();

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
