namespace ServicePulse.Host.Commands
{
    using System;
    using System.Diagnostics;
    using Hosting;

    internal class RunCommand : AbstractCommand
    {
        public override void Execute(HostArguments args)
        {
            using (var service = new Host(args))
            {
                service.Run();

                if (!Environment.UserInteractive)
                {
                    return;
                }

                Process.Start(args.Url);
                Console.WriteLine("Running on {0}", args.Url);
                Console.WriteLine("Press enter to exit");
                Console.ReadLine();
            }
        }
    }
}