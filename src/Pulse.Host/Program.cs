namespace Pulse.Host
{
    using System;
    using System.Diagnostics;
    using System.ServiceProcess;
    using Nancy.Hosting.Self;

    public class Program : ServiceBase
    {
        NancyHost nancyHost;
        const string url = "http://localhost:1234";

        static void Main()
        {
            using (var service = new Program())
            {
                if (Environment.UserInteractive)
                {
                    service.OnStart(null);
                    Process.Start(url);
                    Console.WriteLine("Running on {0}", url);
                    Console.WriteLine("Press enter to exit");
                    Console.ReadLine();
                    service.OnStop();
                }
                else
                {
                    Run(service);
                }
            }
        }

        protected override void OnStart(string[] args)
        {
            nancyHost = new NancyHost(new Uri(url), new PulseBootstrapper());
            nancyHost.Start();
        }

        protected override void OnStop()
        {
            nancyHost.Dispose();
        }
    }
}
