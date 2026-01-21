namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when multiple proxy addresses are in the X-Forwarded-For header (proxy chain).
    /// The rightmost (last) entry should be used as it represents the most recent proxy.
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
        public async Task Should_use_rightmost_proto_from_chain()
        {
            var result = await SendRequestWithHeaders(
                forwardedProto: "https, http");

            // Should use rightmost protocol
            Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        }

        [Test]
        public async Task Should_use_rightmost_host_from_chain()
        {
            var result = await SendRequestWithHeaders(
                forwardedHost: "first.example.com, second.example.com");

            // Should use rightmost host
            Assert.That(result.Processed.Host, Is.EqualTo("second.example.com"));
        }

        [Test]
        public async Task Should_consume_entries_after_processing()
        {
            // TrustAllProxies=true processes all X-Forwarded-For entries
            // But Proto and Host only process ONE entry (rightmost) per pass
            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1",
                forwardedProto: "https, http",
                forwardedHost: "first.example.com, second.example.com");

            // X-Forwarded-For: all entries consumed when TrustAllProxies=true
            Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);

            // Proto and Host: only rightmost entry consumed, rest remain
            Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
            Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("first.example.com"));
        }
    }
}
