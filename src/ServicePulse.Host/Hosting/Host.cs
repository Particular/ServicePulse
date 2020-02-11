using Microsoft.Owin.Hosting;
using ServicePulse.Host.Owin;

namespace ServicePulse.Host.Hosting
{
    using System;
    using System.ServiceProcess;

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
            owinHost = WebApp.Start<OwinBootstrapper>(arguments.Url);
        }

        protected override void OnStop()
        {
            owinHost.Dispose();
        }

        protected override void Dispose(bool disposing)
        {
            OnStop();
            base.Dispose(disposing);
        }

        readonly HostArguments arguments;
        IDisposable owinHost;
    }
}