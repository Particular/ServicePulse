namespace ServicePulse.Host.Commands
{
    using System.IO;
    using System.Text.RegularExpressions;
    using ServicePulse.Host.Hosting;

    class RemoveDeprecatedOveridesCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            DeleteAppJsFile(args);
        }

        static void DeleteAppJsFile(HostArguments args)
        {

            var directoryPath = args.OutputPath;

            var configPath = Path.Combine(directoryPath, "config.js");

            if (File.Exists(configPath))
            {
                var config = File.ReadAllText(configPath);
                var match =  Regex.Match(config, @"(service_control_url: ')([\w:/]*)(')")  ;
                // if the installer was given a value use it otherwise use any existing value
                if (match.Success && string.IsNullOrWhiteSpace(args.ServiceControlUrl))
                {
                    args.ServiceControlUrl = match.Value.Replace("service_control_url:", "").Trim();
                }

                File.Delete(configPath);
            }

            var destinationPath = Path.Combine(directoryPath, "js\\app.js");

            if (File.Exists(destinationPath))
            {
                File.Delete(destinationPath);
            }
        }
    }
}