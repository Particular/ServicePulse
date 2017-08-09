namespace ServicePulse.Host.Commands
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using Hosting;

    internal class ExtractCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            ExtractResources(args.OutputPath);

            if (String.IsNullOrEmpty(args.ServiceControlUrl))
            {
                return;
            }

            ExtractAndUpdateConstantsCommand.UpdateVersion(args.OutputPath);
            ExtractAndUpdateConstantsCommand.UpdateConfig(args.OutputPath, args.ServiceControlUrl);

            if (!String.IsNullOrEmpty(args.ServiceControlMonitoringUrl))
            {
                ExtractAndUpdateConstantsCommand.UpdateMonitoringConfig(args.OutputPath, args.ServiceControlMonitoringUrl);
            }
        }

        static void ExtractResources(string directoryPath)
        {
            var assembly = Assembly.GetExecutingAssembly();
            var resources = assembly.GetManifestResourceNames().Where(x => x.StartsWith(@"app\"));
            foreach (var resourceName in resources)
            {
                using (var resourceStream = assembly.GetManifestResourceStream(resourceName))
                {
                    var fileName = resourceName.Replace(@"app\", String.Empty);
                    var destinationPath = Path.Combine(directoryPath, fileName);
                    Console.WriteLine("Unpacking '{0}' to '{1}'...", fileName, destinationPath);

                    Directory.CreateDirectory(Path.GetDirectoryName(destinationPath));

                    if (File.Exists(destinationPath))
                    {
                        File.Delete(destinationPath);
                    }

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