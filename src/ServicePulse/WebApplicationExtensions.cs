namespace ServicePulse;

using Microsoft.AspNetCore.HttpOverrides;

static class WebApplicationExtensions
{
    public static void UseForwardedHeaders(this WebApplication app, ServicePulseHostSettings settings)
    {
        // Register debug endpoint first (before early return) so it's always available in Development
        if (app.Environment.IsDevelopment())
        {
            app.MapGet("/debug/request-info", (HttpContext context) =>
            {
                var remoteIp = context.Connection.RemoteIpAddress;

                // Processed values (after ForwardedHeaders middleware, if enabled)
                var scheme = context.Request.Scheme;
                var host = context.Request.Host.ToString();
                var remoteIpAddress = remoteIp?.ToString();

                // Raw forwarded headers (what remains after middleware processing)
                // Note: When ForwardedHeaders middleware processes headers from a trusted proxy,
                // it consumes (removes) them from the request headers
                var xForwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
                var xForwardedProto = context.Request.Headers["X-Forwarded-Proto"].ToString();
                var xForwardedHost = context.Request.Headers["X-Forwarded-Host"].ToString();

                // Configuration
                var knownProxies = settings.ForwardedHeadersKnownProxies.Select(p => p.ToString()).ToArray();
                var knownNetworks = settings.ForwardedHeadersKnownNetworks.Select(n => n.ToString()).ToArray();

                return new
                {
                    processed = new { scheme, host, remoteIpAddress },
                    rawHeaders = new { xForwardedFor, xForwardedProto, xForwardedHost },
                    configuration = new
                    {
                        enabled = settings.ForwardedHeadersEnabled,
                        trustAllProxies = settings.ForwardedHeadersTrustAllProxies,
                        knownProxies,
                        knownNetworks
                    }
                };
            });
        }

        // Forwarded headers processing is enabled by default
        if (!settings.ForwardedHeadersEnabled)
        {
            return;
        }

        // Attempt to process all forwarded headers
        var options = new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.All
        };

        // Clear default loopback-only restrictions
        options.KnownProxies.Clear();
        options.KnownIPNetworks.Clear();

        // Enabled by default
        if (settings.ForwardedHeadersTrustAllProxies)
        {
            // Trust all proxies: remove hop limit
            options.ForwardLimit = null;
        }
        else
        {
            // Only trust explicitly configured proxies and networks
            foreach (var proxy in settings.ForwardedHeadersKnownProxies)
            {
                options.KnownProxies.Add(proxy);
            }

            foreach (var network in settings.ForwardedHeadersKnownNetworks)
            {
                options.KnownIPNetworks.Add(network);
            }
        }

        app.UseForwardedHeaders(options);
    }

    public static void UseHttpsConfiguration(this WebApplication app, ServicePulseHostSettings settings)
    {
        // EnableHsts is disabled by default
        // Hsts is automatically disabled in Development environments
        if (settings.HttpsEnableHsts && !app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        // RedirectHttpToHttps is disabled by default
        if (settings.HttpsRedirectHttpToHttps)
        {
            app.UseHttpsRedirection();
        }
    }
}
