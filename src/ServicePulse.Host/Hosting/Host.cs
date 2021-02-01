namespace ServicePulse.Host.Hosting
{
    using System;
    using System.ServiceProcess;
    using Microsoft.Owin.Hosting;
    using ServicePulse.Host.Owin;

    class Host : ServiceBase
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
            var hostingUrl = UrlHelper.RewriteLocalhostUrl(arguments.Url);
            owinHost = WebApp.Start<OwinBootstrapper>(hostingUrl);
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