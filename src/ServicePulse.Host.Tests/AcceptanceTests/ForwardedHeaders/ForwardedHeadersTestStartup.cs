namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.Owin;
    using global::Owin;
    using ServicePulse.Host.Owin;

    /// <summary>
    /// Test OWIN startup class that configures the forwarded headers middleware pipeline
    /// with the debug endpoint enabled for acceptance testing.
    /// </summary>
    public class ForwardedHeadersTestStartup
    {
        public static ForwardedHeadersOptions ForwardedHeadersOptions { get; set; } = new ForwardedHeadersOptions();

        /// <summary>
        /// The remote IP address to simulate for incoming requests.
        /// Microsoft.Owin.Testing doesn't set RemoteIpAddress, so we inject it.
        /// </summary>
        public static string SimulatedRemoteIpAddress { get; set; } = "127.0.0.1";

        public void Configuration(IAppBuilder app)
        {
            // Inject simulated remote IP for testing (TestServer doesn't set this)
            app.Use<RemoteIpSimulatorMiddleware>(SimulatedRemoteIpAddress);

            // Forwarded headers must be first in the pipeline
            app.UseForwardedHeaders(ForwardedHeadersOptions);

            // Debug endpoint for testing - always enabled in tests
            app.UseDebugRequestInfo(ForwardedHeadersOptions);
        }

        public static void Reset()
        {
            ForwardedHeadersOptions = new ForwardedHeadersOptions();
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        public static void ConfigureDefaults()
        {
            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = true
            };
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        public static void ConfigureDisabled()
        {
            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = false
            };
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        public static void ConfigureWithKnownProxies(params string[] proxies)
        {
            var knownProxies = new List<IPAddress>();
            foreach (var proxy in proxies)
            {
                if (IPAddress.TryParse(proxy, out var ip))
                {
                    knownProxies.Add(ip);
                }
            }

            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = false,
                KnownProxies = knownProxies
            };
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        public static void ConfigureWithKnownNetworks(params string[] networks)
        {
            var knownNetworks = new List<CidrNetwork>();
            foreach (var network in networks)
            {
                if (CidrNetwork.TryParse(network, out var cidr))
                {
                    knownNetworks.Add(cidr);
                }
            }

            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = false,
                KnownNetworks = knownNetworks
            };
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        public static void ConfigureWithKnownProxiesAndNetworks(string[] proxies, string[] networks)
        {
            var knownProxies = new List<IPAddress>();
            foreach (var proxy in proxies)
            {
                if (IPAddress.TryParse(proxy, out var ip))
                {
                    knownProxies.Add(ip);
                }
            }

            var knownNetworks = new List<CidrNetwork>();
            foreach (var network in networks)
            {
                if (CidrNetwork.TryParse(network, out var cidr))
                {
                    knownNetworks.Add(cidr);
                }
            }

            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = false,
                KnownProxies = knownProxies,
                KnownNetworks = knownNetworks
            };
            SimulatedRemoteIpAddress = "127.0.0.1";
        }

        /// <summary>
        /// Configure with unknown proxy - simulates a request from an untrusted IP
        /// </summary>
        public static void ConfigureWithUnknownProxy()
        {
            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = false,
                KnownProxies = new List<IPAddress> { IPAddress.Parse("10.0.0.1") }
            };
            // Simulate request from a different IP than the known proxy
            SimulatedRemoteIpAddress = "192.168.1.100";
        }

        /// <summary>
        /// Configure with unknown network - simulates a request from outside trusted networks
        /// </summary>
        public static void ConfigureWithUnknownNetwork()
        {
            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = false,
                KnownNetworks = new List<CidrNetwork> { CidrNetwork.TryParse("10.0.0.0/8", out var n) ? n : null }
            };
            // Simulate request from an IP outside the known network
            SimulatedRemoteIpAddress = "192.168.1.100";
        }
    }

    /// <summary>
    /// Middleware that injects a simulated remote IP address for testing.
    /// Microsoft.Owin.Testing's TestServer doesn't populate the RemoteIpAddress.
    /// </summary>
    public class RemoteIpSimulatorMiddleware : OwinMiddleware
    {
        readonly string remoteIpAddress;

        public RemoteIpSimulatorMiddleware(OwinMiddleware next, string remoteIpAddress) : base(next)
        {
            this.remoteIpAddress = remoteIpAddress;
        }

        public override Task Invoke(IOwinContext context)
        {
            // Set the server.RemoteIpAddress environment variable
            context.Environment["server.RemoteIpAddress"] = remoteIpAddress;
            return Next.Invoke(context);
        }
    }
}
