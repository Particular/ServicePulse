namespace ServicePulse.Host
{
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

            new CommandRunner(arguments.Commands).Execute(arguments);
        }
    }
}