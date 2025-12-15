namespace ServicePulse.Host.Owin
{
    using System;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using global::Owin;

    public class HttpsMiddleware : OwinMiddleware
    {
        readonly HttpsOptions options;

        public HttpsMiddleware(OwinMiddleware next, HttpsOptions options) : base(next)
        {
            this.options = options;
        }

        public override async Task Invoke(IOwinContext context)
        {
            // Skip if no HTTPS features are enabled
            // Enabled=true activates all features (direct HTTPS scenario)
            // Individual feature flags also activate the middleware (reverse proxy scenario)
            if (!options.Enabled && !options.EnableHsts && !options.RedirectHttpToHttps)
            {
                await Next.Invoke(context).ConfigureAwait(false);
                return;
            }

            var request = context.Request;
            var response = context.Response;

            // Get the effective scheme (may have been set by ForwardedHeadersMiddleware)
            var scheme = context.Environment.TryGetValue("owin.RequestScheme", out var envScheme)
                ? envScheme?.ToString() ?? request.Scheme
                : request.Scheme;

            // Add HSTS header for HTTPS requests
            if (options.EnableHsts && string.Equals(scheme, "https", StringComparison.OrdinalIgnoreCase))
            {
                var hstsValue = $"max-age={options.HstsMaxAgeSeconds}";
                if (options.HstsIncludeSubDomains)
                {
                    hstsValue += "; includeSubDomains";
                }
                response.Headers.Set("Strict-Transport-Security", hstsValue);
            }

            // Redirect HTTP to HTTPS
            if (options.RedirectHttpToHttps && string.Equals(scheme, "http", StringComparison.OrdinalIgnoreCase))
            {
                // Get the effective host (may have been set by ForwardedHeadersMiddleware)
                var host = context.Environment.TryGetValue("host.RequestHost", out var envHost)
                    ? envHost?.ToString() ?? request.Host.ToString()
                    : request.Host.ToString();

                // Remove port from host if present, we'll add the HTTPS port
                var hostWithoutPort = host.Contains(":") ? host.Substring(0, host.IndexOf(':')) : host;

                // Build the HTTPS URL with optional port
                string httpsUrl;
                if (options.Port.HasValue && options.Port.Value != 443)
                {
                    httpsUrl = $"https://{hostWithoutPort}:{options.Port.Value}{request.PathBase}{request.Path}{request.QueryString}";
                }
                else
                {
                    httpsUrl = $"https://{hostWithoutPort}{request.PathBase}{request.Path}{request.QueryString}";
                }

                response.StatusCode = 307; // Temporary redirect (preserves method)
                response.Headers.Set("Location", httpsUrl);
                return;
            }

            await Next.Invoke(context).ConfigureAwait(false);
        }
    }

    public class HttpsOptions
    {
        public bool Enabled { get; set; } = false;
        public bool RedirectHttpToHttps { get; set; } = false;
        public int? Port { get; set; } = null;
        public bool EnableHsts { get; set; } = false;
        public int HstsMaxAgeSeconds { get; set; } = 31536000;
        public bool HstsIncludeSubDomains { get; set; } = false;
    }

    public static class HttpsExtensions
    {
        public static IAppBuilder UseHttpsMiddleware(this IAppBuilder builder, HttpsOptions options)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }

            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            return builder.Use<HttpsMiddleware>(options);
        }
    }
}
