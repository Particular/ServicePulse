namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests default behavior when forwarded headers are sent and all proxies are trusted (default configuration).
    /// </summary>
    [TestFixture]
    public class When_forwarded_headers_are_sent : ForwardedHeadersTestBase
    {
        [SetUp]
        public void SetUp()
        {
            ForwardedHeadersTestStartup.ConfigureDefaults();
            CreateServer();
        }

        [Test]
        public async Task Headers_should_be_applied_when_trust_all_proxies()
        {
            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
            Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
            Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        }

        [Test]
        public async Task Headers_should_be_consumed_after_processing()
        {
            var result = await SendRequestWithHeaders(
                forwardedFor: "203.0.113.50",
                forwardedProto: "https",
                forwardedHost: "example.com");

            // Headers should be consumed (removed) after processing
            Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
        }
    }
}
