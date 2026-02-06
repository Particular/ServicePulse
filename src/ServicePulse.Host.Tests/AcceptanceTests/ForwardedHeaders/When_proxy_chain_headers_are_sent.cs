namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when multiple values are in the X-Forwarded-* headers (proxy chain).
    /// The leftmost (first) entry represents the original client's value.
    /// </summary>
    [TestFixture]
    public class When_proxy_chain_headers_are_sent : ForwardedHeadersTestBase
    {
        [SetUp]
        public void SetUp()
        {
            ForwardedHeadersTestStartup.ConfigureDefaults();
            CreateServer();
        }

        [Test]
        public async Task Should_use_leftmost_ip_when_trust_all_proxies()
        {
            // Proxy chain: client -> proxy1 -> proxy2 -> server
            // X-Forwarded-For format: client, proxy1, proxy2
            // TrustAllProxies=true processes all entries, ending with leftmost (original client)
            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1");

            // TrustAllProxies=true processes entire chain, returns leftmost (original client)
            Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Should_use_leftmost_proto_from_chain()
        {
            var result = await SendRequestWithHeaders(
                forwardedProto: "https, http");

            // Should use leftmost protocol (original client's scheme)
            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
        }

        [Test]
        public async Task Should_use_leftmost_host_from_chain()
        {
            var result = await SendRequestWithHeaders(
                forwardedHost: "first.example.com, second.example.com");

            // Should use leftmost host (original client's host)
            Assert.That(result.Processed.Host, Is.EqualTo("first.example.com"));
        }

        [Test]
        public async Task Should_consume_all_entries_when_trust_all_proxies()
        {
            // TrustAllProxies=true consumes all entries from all headers (consistent with ASP.NET Core)
            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1",
                forwardedProto: "https, http",
                forwardedHost: "first.example.com, second.example.com");

            // All headers fully consumed when TrustAllProxies=true
            Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
        }
    }
}
