namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Threading.Tasks;
    using Microsoft.Owin;
    using global::Owin;
    using ServicePulse.Host.Owin;

    /// <summary>
    /// Test OWIN startup class that configures the HTTPS middleware pipeline
    /// with a debug endpoint for acceptance testing.
    /// </summary>
    public class HttpsTestStartup
    {
        public static HttpsOptions HttpsOptions { get; set; } = new HttpsOptions();
        public static ForwardedHeadersOptions ForwardedHeadersOptions { get; set; } = new ForwardedHeadersOptions();

        /// <summary>
        /// The scheme to simulate for incoming requests (http or https).
        /// </summary>
        public static string SimulatedScheme { get; set; } = "http";

        /// <summary>
        /// The host to simulate for incoming requests.
        /// </summary>
        public static string SimulatedHost { get; set; } = "localhost";

        public void Configuration(IAppBuilder app)
        {
            // Inject simulated request properties for testing
            app.Use<RequestSimulatorMiddleware>(SimulatedScheme, SimulatedHost);

            // Forwarded headers middleware (processes X-Forwarded-* headers)
            app.UseForwardedHeaders(ForwardedHeadersOptions);

            // HTTPS middleware (HSTS and redirect)
            app.UseHttpsMiddleware(HttpsOptions);

            // Debug endpoint that returns request info
            app.Use<HttpsDebugMiddleware>();
        }

        public static void Reset()
        {
            HttpsOptions = new HttpsOptions();
            ForwardedHeadersOptions = new ForwardedHeadersOptions { Enabled = false };
            SimulatedScheme = "http";
            SimulatedHost = "localhost";
        }

        public static void ConfigureHstsEnabled(int maxAgeSeconds = 31536000, bool includeSubDomains = false)
        {
            HttpsOptions = new HttpsOptions
            {
                EnableHsts = true,
                HstsMaxAgeSeconds = maxAgeSeconds,
                HstsIncludeSubDomains = includeSubDomains
            };
            ForwardedHeadersOptions = new ForwardedHeadersOptions { Enabled = false };
            SimulatedScheme = "https";
            SimulatedHost = "localhost";
        }

        public static void ConfigureRedirectEnabled(int? httpsPort = null)
        {
            HttpsOptions = new HttpsOptions
            {
                RedirectHttpToHttps = true,
                Port = httpsPort
            };
            ForwardedHeadersOptions = new ForwardedHeadersOptions { Enabled = false };
            SimulatedScheme = "http";
            SimulatedHost = "localhost";
        }

        public static void ConfigureAllEnabled(int? httpsPort = null, int maxAgeSeconds = 31536000, bool includeSubDomains = false)
        {
            HttpsOptions = new HttpsOptions
            {
                Enabled = true,
                RedirectHttpToHttps = true,
                Port = httpsPort,
                EnableHsts = true,
                HstsMaxAgeSeconds = maxAgeSeconds,
                HstsIncludeSubDomains = includeSubDomains
            };
            ForwardedHeadersOptions = new ForwardedHeadersOptions { Enabled = false };
            SimulatedScheme = "http";
            SimulatedHost = "localhost";
        }

        public static void ConfigureDisabled()
        {
            HttpsOptions = new HttpsOptions
            {
                Enabled = false,
                RedirectHttpToHttps = false,
                EnableHsts = false
            };
            ForwardedHeadersOptions = new ForwardedHeadersOptions { Enabled = false };
            SimulatedScheme = "http";
            SimulatedHost = "localhost";
        }

        public static void ConfigureWithForwardedHeaders()
        {
            HttpsOptions = new HttpsOptions
            {
                RedirectHttpToHttps = true,
                EnableHsts = true
            };
            ForwardedHeadersOptions = new ForwardedHeadersOptions
            {
                Enabled = true,
                TrustAllProxies = true
            };
            SimulatedScheme = "http";
            SimulatedHost = "localhost";
        }
    }

    /// <summary>
    /// Middleware that injects simulated request properties for testing.
    /// </summary>
    public class RequestSimulatorMiddleware : OwinMiddleware
    {
        readonly string scheme;
        readonly string host;

        public RequestSimulatorMiddleware(OwinMiddleware next, string scheme, string host) : base(next)
        {
            this.scheme = scheme;
            this.host = host;
        }

        public override Task Invoke(IOwinContext context)
        {
            context.Request.Scheme = scheme;
            context.Request.Host = new HostString(host);
            return Next.Invoke(context);
        }
    }

    /// <summary>
    /// Debug middleware that returns request information as JSON.
    /// </summary>
    public class HttpsDebugMiddleware : OwinMiddleware
    {
        public HttpsDebugMiddleware(OwinMiddleware next) : base(next) { }

        public override async Task Invoke(IOwinContext context)
        {
            if (context.Request.Path.ToString().Equals("/debug/https-info", System.StringComparison.OrdinalIgnoreCase))
            {
                var response = context.Response;
                response.ContentType = "application/json";

                var scheme = context.Environment.TryGetValue("owin.RequestScheme", out var envScheme)
                    ? envScheme?.ToString() ?? context.Request.Scheme
                    : context.Request.Scheme;

                var host = context.Environment.TryGetValue("host.RequestHost", out var envHost)
                    ? envHost?.ToString() ?? context.Request.Host.ToString()
                    : context.Request.Host.ToString();

                var json = $@"{{
  ""scheme"": ""{scheme}"",
  ""host"": ""{host}"",
  ""path"": ""{context.Request.Path}"",
  ""queryString"": ""{context.Request.QueryString}""
}}";

                await response.WriteAsync(json).ConfigureAwait(false);
                return;
            }

            await Next.Invoke(context).ConfigureAwait(false);
        }
    }
}
