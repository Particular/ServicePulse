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
                ServiceName = "ServicePulse",
                DisplayName = "ServicePulse in Particular",
                Description = "An Operations Manager’s Best Friend."
            };

            Installers.Add(serviceInstaller);
        }
    }
}