namespace ServicePulse.Host.Commands
{
    using System.IO;
    using System.Reflection;
    using System.Text.RegularExpressions;
    using Hosting;

    internal class UpdateVersionCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            UpdateVersion(args.OutputPath);
        }

        static void UpdateVersion(string directoryPath)
        {
            var appJsPath = Path.Combine(directoryPath, "js/app.js");
            var appJsCode = File.ReadAllText(appJsPath);
            File.WriteAllText(appJsPath,
                Regex.Replace(appJsCode, @"(constant\('version', ')([\w:/.]*)(')", "${1}" + GetFileVersion() + "$3"));
        }

        static string GetFileVersion()
        {
            var customAttributes =
                typeof(AbstractCommand).Assembly.GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute),
                    false);

            if (customAttributes.Length >= 1)
            {
                var fileVersionAttribute = (AssemblyInformationalVersionAttribute)customAttributes[0];
                var informationalVersion = fileVersionAttribute.InformationalVersion;
                return informationalVersion.Split(' ')[0];
            }

            return typeof(AbstractCommand).Assembly.GetName().Version.ToString(4);
        }
    }
}