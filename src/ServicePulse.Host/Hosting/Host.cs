namespace ServicePulse.Host.Hosting
{
    using System;
    using System.Net;
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
            ConfigureForwardedHeaders();
            ConfigureHttps();

#if DEBUG
            // Enable debug endpoint when running interactively in debug builds
            OwinBootstrapper.EnableDebugEndpoint = Environment.UserInteractive;
#endif

            var hostingUrl = UrlHelper.RewriteLocalhostUrl(arguments.Url);
            owinHost = WebApp.Start<OwinBootstrapper>(hostingUrl);
        }

        void ConfigureForwardedHeaders()
        {
            var options = new ForwardedHeadersOptions
            {
                Enabled = arguments.ForwardedHeadersEnabled,
                TrustAllProxies = arguments.ForwardedHeadersTrustAllProxies
            };

            // Parse known proxies
            foreach (var proxyString in arguments.ForwardedHeadersKnownProxies)
            {
                if (IPAddress.TryParse(proxyString, out var proxy))
                {
                    options.KnownProxies.Add(proxy);
                }
            }

            // Parse known networks
            foreach (var networkString in arguments.ForwardedHeadersKnownNetworks)
            {
                if (CidrNetwork.TryParse(networkString, out var network))
                {
                    options.KnownNetworks.Add(network);
                }
            }

            // If specific proxies or networks are configured, disable trust all proxies
            if (options.KnownProxies.Count > 0 || options.KnownNetworks.Count > 0)
            {
                options.TrustAllProxies = false;
            }

            // Set ForwardLimit based on TrustAllProxies (align with ASP.NET Core behavior)
            if (options.TrustAllProxies)
            {
                options.ForwardLimit = null; // No limit - process all entries
            }
            // else ForwardLimit defaults to 1

            OwinBootstrapper.ForwardedHeadersOptions = options;
        }

        void ConfigureHttps()
        {
            var options = new HttpsOptions
            {
                Enabled = arguments.HttpsEnabled,
                RedirectHttpToHttps = arguments.HttpsRedirectHttpToHttps,
                Port = arguments.HttpsPort,
                EnableHsts = arguments.HttpsEnableHsts,
                HstsMaxAgeSeconds = arguments.HttpsHstsMaxAgeSeconds,
                HstsIncludeSubDomains = arguments.HttpsHstsIncludeSubDomains
            };

            OwinBootstrapper.HttpsOptions = options;
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