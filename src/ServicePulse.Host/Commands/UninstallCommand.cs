namespace ServicePulse.Host.Commands
{
    using System.Collections;

    internal class UninstallCommand : ServiceCommand
    {
        public UninstallCommand() : base(installer => installer.Uninstall(new Hashtable()))
        {
        }
    }
}