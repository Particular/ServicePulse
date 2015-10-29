namespace ServicePulse.Host.Commands
{
    using System.IO;
    using ServicePulse.Host.Hosting;

    class RemoveDeprecatedOveridesCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            DeleteAppJsFile(args.OutputPath);
        }

        static void DeleteAppJsFile(string directoryPath)
        {
            var configPath = Path.Combine(directoryPath, "config.js");

            if (File.Exists(configPath))
            {
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