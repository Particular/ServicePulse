namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when headers are sent from trusted sources (known proxies or networks).
    /// Headers should be processed when the request comes from a trusted source.
    /// </summary>
    [TestFixture]
    public class When_trusted_source_sends_headers : ForwardedHeadersTestBase
    {
        [Test]
        public async Task Headers_should_be_processed_from_known_proxy()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownProxies("127.0.0.1", "::1");
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
            Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Headers_should_be_processed_from_known_network()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownNetworks("127.0.0.0/8", "::1/128");
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
            Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Configuration_should_show_known_proxies()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownProxies("127.0.0.1", "::1");
            CreateServer();

            var result = await SendRequestWithHeaders();

            Assert.That(result.Configuration.Enabled, Is.True);
            Assert.That(result.Configuration.TrustAllProxies, Is.False);
            Assert.That(result.Configuration.KnownProxies, Has.Length.GreaterThan(0));
        }

        [Test]
        public async Task Configuration_should_show_known_networks()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownNetworks("127.0.0.0/8", "::1/128");
            CreateServer();

            var result = await SendRequestWithHeaders();

            Assert.That(result.Configuration.Enabled, Is.True);
            Assert.That(result.Configuration.TrustAllProxies, Is.False);
            Assert.That(result.Configuration.KnownNetworks, Has.Length.GreaterThan(0));
        }

        [Test]
        public async Task Headers_should_be_processed_when_matching_either_proxy_or_network()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownProxiesAndNetworks(
                new[] { "127.0.0.1" },
                new[] { "::1/128" });
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
            Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Configuration_should_show_both_proxies_and_networks()
        {
            ForwardedHeadersTestStartup.ConfigureWithKnownProxiesAndNetworks(
                new[] { "127.0.0.1" },
                new[] { "::1/128" });
            CreateServer();

            var result = await SendRequestWithHeaders();

            Assert.That(result.Configuration.Enabled, Is.True);
            Assert.That(result.Configuration.TrustAllProxies, Is.False);
            Assert.That(result.Configuration.KnownProxies, Has.Length.GreaterThan(0));
            Assert.That(result.Configuration.KnownNetworks, Has.Length.GreaterThan(0));
        }
    }
}
