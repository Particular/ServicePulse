namespace ServicePulse.Host.Commands
{
    using System.IO;
    using System.Reflection;
    using System.Text.RegularExpressions;
    using Hosting;

    class ExtractAndUpdateConstantsCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            ExtractApp(args);
            UpdateVersion(args.OutputPath);
            UpdateConfig(args.OutputPath, args.ServiceControlUrl);
            UpdateMonitoringConfig(args.OutputPath, args.ServiceControlMonitoringUrl);
        }

        static void ExtractApp(HostArguments args)
        {
            string directoryPath = args.OutputPath;
            var assembly = Assembly.GetExecutingAssembly();

            using (var resourceStream = assembly.GetManifestResourceStream(@"app\js\app.constants.js"))
            {
                var destinationPath = Path.Combine(directoryPath, "js\\app.constants.js");

                Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));

                if (File.Exists(destinationPath))
                {
                    MigrateServiceControlUrl(args, destinationPath);

                    File.Delete(destinationPath);
                }

                using (Stream file = File.OpenWrite(destinationPath))
                {
                    resourceStream.CopyTo(file);
                    file.Flush();
                }
            }
        }

        public static void UpdateConfig(string directoryPath, string serviceControlUrl)
        {
            var appJsPath = Path.Combine(directoryPath, "js/app.constants.js");
            var appJsCode = File.ReadAllText(appJsPath);
            File.WriteAllText(appJsPath, Regex.Replace(appJsCode, @"(service_control_url\s*\:\s*['""])(.*?)(['""])", "$1" + serviceControlUrl + "$3"));
        }

        public static void UpdateMonitoringConfig(string directoryPath, string serviceControlMonitoringUrl)
        {
            var appJsPath = Path.Combine(directoryPath, "js/app.constants.js");
            var appJsCode = File.ReadAllText(appJsPath);
            File.WriteAllText(appJsPath, Regex.Replace(appJsCode, @"(monitoring_urls\s*\:\s*[\s*['""]*)(.*?)(['""]])", "$1" + serviceControlMonitoringUrl + "$3"));
        }

        public static void UpdateVersion(string directoryPath)
        {
            var appJsPath = Path.Combine(directoryPath, "js/app.constants.js");
            var appJsCode = File.ReadAllText(appJsPath);
            var updatedContent = Regex.Replace(appJsCode, @"(version\s*\:\s*['""])(.*?)(['""])", "${1}" + GetFileVersion() + "$3");
            File.WriteAllText(appJsPath, updatedContent);
        }

        static string GetFileVersion()
        {
            var customAttributes =
                typeof(AbstractCommand).Assembly.GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute), false);

            if (customAttributes.Length >= 1)
            {
                var fileVersionAttribute = (AssemblyInformationalVersionAttribute)customAttributes[0];
                var informationalVersion = fileVersionAttribute.InformationalVersion;
                return informationalVersion.Split('+')[0];
            }

            return typeof(AbstractCommand).Assembly.GetName().Version.ToString(4);
        }
    }
}
