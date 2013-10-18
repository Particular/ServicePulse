namespace ServicePulse.Host.Commands
{
    using System.IO;
    using System.Text.RegularExpressions;
    using Hosting;

    internal abstract class AbstractCommand
    {
        public abstract void Execute(HostArguments args);

        public static void UpdateConfig(string directoryPath, string serviceControlUrl)
        {
            var appJsPath = Path.Combine(directoryPath, "config.js");
            var appJsCode = File.ReadAllText(appJsPath);
            File.WriteAllText(appJsPath,
                Regex.Replace(appJsCode, @"(service_control_url: ')([\w:/]*)(')", "$1" + serviceControlUrl + "$3"));
        }
    }
}