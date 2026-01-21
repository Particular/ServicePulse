namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when headers are sent from untrusted sources.
    /// When known proxies/networks are configured but request doesn't come from one, headers should be ignored.
    /// </summary>
    [TestFixture]
    public class When_untrusted_source_sends_headers : ForwardedHeadersTestBase
    {
        [Test]
        public async Task Headers_should_not_be_processed_from_unknown_proxy()
        {
            ForwardedHeadersTestStartup.ConfigureWithUnknownProxy();
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
            Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.Not.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Headers_should_not_be_processed_from_unknown_network()
        {
            ForwardedHeadersTestStartup.ConfigureWithUnknownNetwork();
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
            Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.Not.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Headers_should_remain_in_request_from_unknown_proxy()
        {
            ForwardedHeadersTestStartup.ConfigureWithUnknownProxy();
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
            Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
            Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
        }

        [Test]
        public async Task Headers_should_remain_in_request_from_unknown_network()
        {
            ForwardedHeadersTestStartup.ConfigureWithUnknownNetwork();
            CreateServer();

            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
            Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
            Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
        }
    }
}
