namespace ServicePulse.Host
{
    using System;
    using System.Diagnostics;
    using Commands;
    using Hosting;

    public class Program
    {
        static void Main(string[] args)
        {
            var arguments = new HostArguments(args);

            if (arguments.Help)
            {
                arguments.PrintUsage();
                return;
            }

            if (arguments.ExecutionMode != ExecutionMode.Run)
            {
                new CommandRunner(arguments).Execute();
                return;
            }

            using (var service = new Host(arguments))
            {
                service.Run();

                if (!Environment.UserInteractive)
                {
                    return;
                }

                Process.Start(arguments.Url);
                Console.WriteLine("Running on {0}", arguments.Url);
                Console.WriteLine("Press enter to exit");
                Console.ReadLine();
            }
        }
    }
}