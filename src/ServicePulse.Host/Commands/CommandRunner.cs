namespace ServicePulse.Host.Commands
{
    using Hosting;

    internal class CommandRunner
    {
        public CommandRunner(HostArguments args)
        {
            this.args = args;
        }

        public void Execute()
        {
            if (args.ExecutionMode == ExecutionMode.Install)
            {
                new InstallCommand().Execute(args);
            }

            if (args.ExecutionMode == ExecutionMode.Uninstall)
            {
                new UninstallCommand().Execute(args);
            }

            if (args.ExecutionMode == ExecutionMode.Extract)
            {
                new ExtractCommand().Execute(args);
            }
        }

        readonly HostArguments args;
    }
}