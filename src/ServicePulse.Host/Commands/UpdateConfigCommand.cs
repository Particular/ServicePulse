namespace ServicePulse.Host.Commands
{
    using System;
    using System.IO;
    using System.Reflection;
    using Hosting;

    internal class UpdateConfigCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            if (String.IsNullOrEmpty(args.ServiceControlUrl))
            {
                return;
            }

            ExtractConfig(args.OutputPath);

            UpdateConfig(args.OutputPath, args.ServiceControlUrl);
        }

        static void ExtractConfig(string directoryPath)
        {
            var assembly = Assembly.GetExecutingAssembly();
            
            using (var resourceStream = assembly.GetManifestResourceStream(@"app\config.js"))
            {
                var destinationPath = Path.Combine(directoryPath, "config.js");

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