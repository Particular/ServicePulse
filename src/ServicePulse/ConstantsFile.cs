namespace ServicePulse;

using System.Reflection;

class ConstantsFile
{
    public static string GetContent()
    {
        var defaultRoute = Environment.GetEnvironmentVariable("DEFAULT_ROUTE") ?? "/dashboard";
        var version = GetVersionInformation();
        var showPendingRetry = Environment.GetEnvironmentVariable("SHOW_PENDING_RETRY") ?? "false";

        var constantsFile = $$"""
window.defaultConfig = {
  default_route: '{{defaultRoute}}',
  version: '{{version}}',
  service_control_url: '/api/',
  monitoring_urls: ['/monitoring-api/'],
  showPendingRetry: {{showPendingRetry}},
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
