namespace Pulse.Host
{
    using System.ComponentModel;
    using System.ServiceProcess;

    [RunInstaller(true)]
    public class Installer : ServiceProcessInstaller
    {
        private ServiceProcessInstaller processInstaller;
        private readonly ServiceInstaller serviceInstaller;

        public Installer()
        {
            Account = ServiceAccount.LocalSystem;
            serviceInstaller = new ServiceInstaller
            {
                StartType = ServiceStartMode.Automatic,
                ServiceName = "AdvancedInstallerLicenser",
                DisplayName = "Advanced Installer Licenser",
                Description = "Utility for cloud agent that automatically licenses AdvanceInstaller"
            };

            Installers.Add(serviceInstaller);
        }
    }
}