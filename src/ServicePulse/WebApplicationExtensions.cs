namespace ServicePulse;

using Microsoft.AspNetCore.HttpOverrides;

static class WebApplicationExtensions
{
    public static void UseForwardedHeaders(this WebApplication app, Settings settings)
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
                var knownNetworks = settings.ForwardedHeadersKnownNetworks.Select(n => $"{n.Prefix}/{n.PrefixLength}").ToArray();

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

        if (!settings.ForwardedHeadersEnabled)
        {
            return;
        }

        var options = new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.All
        };

        // Clear default loopback-only restrictions
        options.KnownProxies.Clear();
        options.KnownNetworks.Clear();

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
                options.KnownNetworks.Add(network);
            }
        }

        app.UseForwardedHeaders(options);
    }

    public static void UseHttpsConfiguration(this WebApplication app, Settings settings)
    {
        if (settings.HttpsEnableHsts && !app.Environment.IsDevelopment())
        {
            app.UseHsts();
        }

        if (settings.HttpsRedirectHttpToHttps)
        {
            app.UseHttpsRedirection();
        }
    }

    public static void ConfigureHsts(this IServiceCollection services, Settings settings)
    {
        if (!settings.HttpsEnableHsts)
        {
            return;
        }

        services.AddHsts(options =>
        {
            options.MaxAge = TimeSpan.FromSeconds(settings.HttpsHstsMaxAgeSeconds);
            options.IncludeSubDomains = settings.HttpsHstsIncludeSubDomains;
        });
    }

    public static void ConfigureHttpsRedirection(this IServiceCollection services, Settings settings)
    {
        if (!settings.HttpsRedirectHttpToHttps || !settings.HttpsPort.HasValue)
        {
            return;
        }

        services.AddHttpsRedirection(options =>
        {
            options.HttpsPort = settings.HttpsPort.Value;
        });
    }
}
