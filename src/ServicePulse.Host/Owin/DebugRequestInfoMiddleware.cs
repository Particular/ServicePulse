namespace ServicePulse.Host.Owin
{
    using System;
    using System.Linq;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using global::Owin;

    public class DebugRequestInfoMiddleware : OwinMiddleware
    {
        readonly ForwardedHeadersOptions options;

        public DebugRequestInfoMiddleware(OwinMiddleware next, ForwardedHeadersOptions options) : base(next)
        {
            this.options = options;
        }

        public override async Task Invoke(IOwinContext context)
        {
            if (context.Request.Path.ToString().Equals("/debug/request-info", StringComparison.OrdinalIgnoreCase))
            {
                var response = context.Response;
                response.ContentType = "application/json";

                // Check for forwarded values in environment, fall back to request properties
                var remoteIpAddress = context.Environment.TryGetValue("server.RemoteIpAddress", out var forwardedIp)
                    ? forwardedIp?.ToString() ?? context.Request.RemoteIpAddress ?? "unknown"
                    : context.Request.RemoteIpAddress ?? "unknown";

                var scheme = context.Environment.TryGetValue("owin.RequestScheme", out var forwardedScheme)
                    ? forwardedScheme?.ToString() ?? context.Request.Scheme ?? "unknown"
                    : context.Request.Scheme ?? "unknown";

                var host = context.Environment.TryGetValue("host.RequestHost", out var forwardedHost)
                    ? forwardedHost?.ToString() ?? context.Request.Host.ToString()
                    : context.Request.Host.ToString();

                // Raw headers (what remains after middleware processing)
                var xForwardedFor = context.Request.Headers.Get("X-Forwarded-For") ?? "";
                var xForwardedProto = context.Request.Headers.Get("X-Forwarded-Proto") ?? "";
                var xForwardedHost = context.Request.Headers.Get("X-Forwarded-Host") ?? "";

                // Configuration
                var knownProxies = string.Join(", ", options.KnownProxies.Select(p => $"\"{p}\""));
                var knownNetworks = string.Join(", ", options.KnownNetworks.Select(n => $"\"{n.BaseAddress}/{n.PrefixLength}\""));

                var json = $@"{{
  ""processed"": {{
    ""scheme"": ""{scheme}"",
    ""host"": ""{host}"",
    ""remoteIpAddress"": ""{remoteIpAddress}""
  }},
  ""rawHeaders"": {{
    ""xForwardedFor"": ""{xForwardedFor}"",
    ""xForwardedProto"": ""{xForwardedProto}"",
    ""xForwardedHost"": ""{xForwardedHost}""
  }},
  ""configuration"": {{
    ""enabled"": {options.Enabled.ToString().ToLowerInvariant()},
    ""trustAllProxies"": {options.TrustAllProxies.ToString().ToLowerInvariant()},
    ""knownProxies"": [{knownProxies}],
    ""knownNetworks"": [{knownNetworks}]
  }}
}}";

                await response.WriteAsync(json).ConfigureAwait(false);
                return;
            }

            await Next.Invoke(context).ConfigureAwait(false);
        }
    }

    public static class DebugRequestInfoExtensions
    {
        public static IAppBuilder UseDebugRequestInfo(this IAppBuilder builder, ForwardedHeadersOptions options)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }

            return builder.Use<DebugRequestInfoMiddleware>(options);
        }
    }
}
