namespace ServicePulse.Host.Commands
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Text.RegularExpressions;
    using Hosting;

    internal class ExtractCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            ExportResources(args.OutputPath);

            UpdateConfig(args);
        }

        static void UpdateConfig(HostArguments args)
        {
            var appJsPath = Path.Combine(args.OutputPath, "config.js");
            var appJsCode = File.ReadAllText(appJsPath);
            File.WriteAllText(appJsPath,
                Regex.Replace(appJsCode, @"(service_control_url: ')([\w:/]*)(')", "$1" + args.ServiceControlUrl + "$3"));
        }

        void ExportResources(string directoryPath)
        {
            var assembly = GetType().Assembly;
            var resources = assembly.GetManifestResourceNames().Where(x => x.StartsWith(@"app\"));
            foreach (var resourceName in resources)
            {
                using (var resourceStream = assembly.GetManifestResourceStream(resourceName))
                {
                    var fileName = resourceName.Replace(@"app\", String.Empty);
                    var destinationPath = Path.Combine(directoryPath, fileName);
                    Console.WriteLine("Unpacking '{0}' to '{1}'...", fileName, destinationPath);

                    Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));

                    using (Stream file = File.OpenWrite(destinationPath))
                    {
                        resourceStream.CopyTo(file);
                        file.Flush();
                    }
                }
            }
        }
    }
}