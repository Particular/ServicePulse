namespace ServicePulse.Host.Hosting
{
    using System;
    using System.ServiceProcess;
    using global::Nancy.Hosting.Self;
    using Nancy;

    internal class Host : ServiceBase
    {
        public Host(HostArguments args)
        {
            arguments = args;
        }

        public void Run()
        {
            if (Environment.UserInteractive)
            {
                OnStart(null);
                return;
            }

            Run(this);
        }

        protected override void OnStart(string[] args)
        {
            nancyHost = new NancyHost(new Uri(arguments.Url), new PulseBootstrapper());
            nancyHost.Start();
        }

        protected override void OnStop()
        {
            nancyHost.Dispose();
        }

        protected override void Dispose(bool disposing)
        {
            OnStop();
            base.Dispose(disposing);
        }

        readonly HostArguments arguments;
        NancyHost nancyHost;
    }
}