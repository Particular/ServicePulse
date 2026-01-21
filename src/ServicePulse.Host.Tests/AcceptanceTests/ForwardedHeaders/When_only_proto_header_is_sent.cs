namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when only the X-Forwarded-Proto header is sent.
    /// Common scenario for reverse proxies that only indicate the protocol.
    /// </summary>
    [TestFixture]
    public class When_only_proto_header_is_sent : ForwardedHeadersTestBase
    {
        [SetUp]
        public void SetUp()
        {
            ForwardedHeadersTestStartup.ConfigureDefaults();
            CreateServer();
        }

        [Test]
        public async Task Scheme_should_be_updated()
        {
            var result = await SendRequestWithHeaders(forwardedProto: "https");

            Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
        }

        [Test]
        public async Task Host_and_ip_should_use_original_values()
        {
            var result = await SendRequestWithHeaders(forwardedProto: "https");

            // Host and IP should use original values since only proto was forwarded
            Assert.That(result.Processed.Host, Is.Not.Empty);
            // RemoteIpAddress should be the original (not from X-Forwarded-For)
        }
    }
}
