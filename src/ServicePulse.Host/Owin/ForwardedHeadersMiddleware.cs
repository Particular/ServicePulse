namespace ServicePulse.Host.Owin
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using global::Owin;

    public class ForwardedHeadersMiddleware : OwinMiddleware
    {
        readonly ForwardedHeadersOptions options;

        public ForwardedHeadersMiddleware(OwinMiddleware next, ForwardedHeadersOptions options) : base(next)
        {
            this.options = options;
        }

        public override Task Invoke(IOwinContext context)
        {
            if (!options.Enabled)
            {
                return Next.Invoke(context);
            }

            var request = context.Request;

            if (!IsTrustedProxy(request.RemoteIpAddress))
            {
                return Next.Invoke(context);
            }

            // Process X-Forwarded-Proto (take leftmost value - original client's scheme)
            var forwardedProto = request.Headers.Get("X-Forwarded-Proto");
            if (!string.IsNullOrEmpty(forwardedProto))
            {
                var values = forwardedProto.Split(',').Select(v => v.Trim()).ToList();
                var scheme = values[0];
                context.Environment["owin.RequestScheme"] = scheme;

                // Consume the header - when TrustAllProxies, consume all values (consistent with ASP.NET Core)
                if (options.TrustAllProxies)
                {
                    request.Headers.Remove("X-Forwarded-Proto");
                }
                else
                {
                    values.RemoveAt(0);
                    if (values.Count > 0)
                    {
                        request.Headers.Set("X-Forwarded-Proto", string.Join(", ", values));
                    }
                    else
                    {
                        request.Headers.Remove("X-Forwarded-Proto");
                    }
                }
            }

            // Process X-Forwarded-Host (take leftmost value - original client's host)
            var forwardedHost = request.Headers.Get("X-Forwarded-Host");
            if (!string.IsNullOrEmpty(forwardedHost))
            {
                var values = forwardedHost.Split(',').Select(v => v.Trim()).ToList();
                var host = values[0];
                context.Environment["host.RequestHost"] = host;
                request.Headers.Set("Host", host);

                // Consume the header - when TrustAllProxies, consume all values (consistent with ASP.NET Core)
                if (options.TrustAllProxies)
                {
                    request.Headers.Remove("X-Forwarded-Host");
                }
                else
                {
                    values.RemoveAt(0);
                    if (values.Count > 0)
                    {
                        request.Headers.Set("X-Forwarded-Host", string.Join(", ", values));
                    }
                    else
                    {
                        request.Headers.Remove("X-Forwarded-Host");
                    }
                }
            }

            // Process X-Forwarded-For (right-to-left with ForwardLimit, consume processed entries)
            var forwardedFor = request.Headers.Get("X-Forwarded-For");
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var entries = forwardedFor.Split(',').Select(v => v.Trim()).ToList();
                var entriesProcessed = 0;
                // When TrustAllProxies is enabled, ignore ForwardLimit (consistent with ASP.NET Core)
                var limit = options.TrustAllProxies ? int.MaxValue : (options.ForwardLimit ?? int.MaxValue);

                // Process from right to left
                while (entries.Count > 0 && entriesProcessed < limit)
                {
                    var currentEntry = entries[entries.Count - 1];
                    entries.RemoveAt(entries.Count - 1);
                    entriesProcessed++;

                    // Strip port from IP address if present (e.g., "192.168.1.1:8080" or "[::1]:8080")
                    var currentIp = StripPort(currentEntry);
                    context.Environment["server.RemoteIpAddress"] = currentIp;

                    // If there are more entries, check if we should continue
                    if (entries.Count > 0 && entriesProcessed < limit)
                    {
                        // For TrustAllProxies, continue processing all
                        // For known proxies/networks, check if current IP is trusted
                        if (!options.TrustAllProxies && !IsTrustedIp(currentIp))
                        {
                            break;
                        }
                    }
                }

                // Update header with remaining entries
                if (entries.Count > 0)
                {
                    request.Headers.Set("X-Forwarded-For", string.Join(", ", entries));
                }
                else
                {
                    request.Headers.Remove("X-Forwarded-For");
                }
            }

            return Next.Invoke(context);
        }

        static string StripPort(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress))
            {
                return ipAddress;
            }

            // IPv6 addresses are enclosed in brackets: [::1] or [::1]:8080
            if (ipAddress.StartsWith("["))
            {
                var closingBracket = ipAddress.IndexOf(']');
                if (closingBracket > 0)
                {
                    // Return just the IPv6 address without brackets or port
                    return ipAddress.Substring(1, closingBracket - 1);
                }
                // Malformed, return as-is
                return ipAddress;
            }

            // IPv4 or hostname: look for port separator
            var colonIndex = ipAddress.IndexOf(':');
            return colonIndex > 0 ? ipAddress.Substring(0, colonIndex) : ipAddress;
        }

        bool IsTrustedProxy(string remoteIpAddress)
        {
            if (options.TrustAllProxies)
            {
                return true;
            }

            return IsTrustedIp(remoteIpAddress);
        }

        bool IsTrustedIp(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress))
            {
                return false;
            }

            if (!IPAddress.TryParse(ipAddress, out var ip))
            {
                return false;
            }

            // Normalize IPv4-mapped IPv6 addresses (::ffff:192.168.1.1) to IPv4
            if (ip.IsIPv4MappedToIPv6)
            {
                ip = ip.MapToIPv4();
            }

            // Check known proxies (also normalizing for comparison)
            foreach (var proxy in options.KnownProxies)
            {
                var normalizedProxy = proxy.IsIPv4MappedToIPv6 ? proxy.MapToIPv4() : proxy;
                if (normalizedProxy.Equals(ip))
                {
                    return true;
                }
            }

            // Check known networks
            foreach (var network in options.KnownNetworks)
            {
                if (network.Contains(ip))
                {
                    return true;
                }
            }

            return false;
        }
    }

    public class ForwardedHeadersOptions
    {
        public bool Enabled { get; set; } = true;
        public bool TrustAllProxies { get; set; } = true;
        public int? ForwardLimit { get; set; } = 1;
        public List<IPAddress> KnownProxies { get; set; } = new List<IPAddress>();
        public List<CidrNetwork> KnownNetworks { get; set; } = new List<CidrNetwork>();
    }

    public class CidrNetwork
    {
        public IPAddress BaseAddress { get; }
        public int PrefixLength { get; }

        public CidrNetwork(IPAddress baseAddress, int prefixLength)
        {
            BaseAddress = baseAddress;
            PrefixLength = prefixLength;
        }

        public static bool TryParse(string value, out CidrNetwork network)
        {
            network = null;

            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            var parts = value.Split('/');
            if (parts.Length != 2)
            {
                return false;
            }

            if (!IPAddress.TryParse(parts[0], out var address))
            {
                return false;
            }

            if (!int.TryParse(parts[1], out var prefixLength))
            {
                return false;
            }

            if (prefixLength < 0 || prefixLength > (address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork ? 32 : 128))
            {
                return false;
            }

            network = new CidrNetwork(address, prefixLength);
            return true;
        }

        public bool Contains(IPAddress address)
        {
            if (address.AddressFamily != BaseAddress.AddressFamily)
            {
                return false;
            }

            var baseBytes = BaseAddress.GetAddressBytes();
            var addressBytes = address.GetAddressBytes();

            var wholeBytes = PrefixLength / 8;
            var remainingBits = PrefixLength % 8;

            for (var i = 0; i < wholeBytes; i++)
            {
                if (baseBytes[i] != addressBytes[i])
                {
                    return false;
                }
            }

            if (remainingBits > 0 && wholeBytes < baseBytes.Length)
            {
                var mask = (byte)(0xFF << (8 - remainingBits));
                if ((baseBytes[wholeBytes] & mask) != (addressBytes[wholeBytes] & mask))
                {
                    return false;
                }
            }

            return true;
        }
    }

    public static class ForwardedHeadersExtensions
    {
        public static IAppBuilder UseForwardedHeaders(this IAppBuilder builder, ForwardedHeadersOptions options)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }

            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            return builder.Use<ForwardedHeadersMiddleware>(options);
        }
    }
}
