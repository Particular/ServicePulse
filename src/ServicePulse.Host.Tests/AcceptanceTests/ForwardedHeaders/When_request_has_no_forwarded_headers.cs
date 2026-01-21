namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when request has no forwarded headers.
    /// </summary>
    [TestFixture]
    public class When_request_has_no_forwarded_headers : ForwardedHeadersTestBase
    {
        [SetUp]
        public void SetUp()
        {
            ForwardedHeadersTestStartup.ConfigureDefaults();
            CreateServer();
        }

        [Test]
        public async Task Original_values_should_be_preserved()
        {
            // No forwarded headers
            var result = await SendRequestWithHeaders();

            // Original request values should be used
            Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
            Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
            Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
        }
    }
}
