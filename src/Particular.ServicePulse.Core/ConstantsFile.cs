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
  isIntegrated: {{settings.IsIntegrated.ToString().ToLower()}}
}
""";

        return constantsFile;
    }

    static string GetVersionInformation()
        => typeof(ConstantsFile).Assembly
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .SingleOrDefault(attribute => attribute.Key == "MajorMinorPatch")
            ?.Value ?? "0.0.0";
}
