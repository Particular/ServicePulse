namespace ServicePulse.Host.Commands
{
    using System.IO;
    using System.Text.RegularExpressions;
    using Hosting;

    abstract class AbstractCommand
    {
        public abstract void Execute(HostArguments args);

        public static void MigrateServiceControlUrl(HostArguments args, string filePath)
        {
            var config = File.ReadAllText(filePath);
            var match = Regex.Match(config, @"(service_control_url: ')([\w:/]*)(')");

            // if the installer was given a value use it otherwise use any existing value
            if (match.Success && string.IsNullOrWhiteSpace(args.ServiceControlUrl))
            {
                args.ServiceControlUrl = match.Groups[2].Value;
            }
        }
    }
}