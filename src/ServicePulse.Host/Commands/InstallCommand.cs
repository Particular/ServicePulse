namespace ServicePulse.Host.Commands
{
    using System.Collections;

    internal class InstallCommand : ServiceCommand
    {
        public InstallCommand() : base(installer => installer.Install(new Hashtable()))
        {
        }
    }
}