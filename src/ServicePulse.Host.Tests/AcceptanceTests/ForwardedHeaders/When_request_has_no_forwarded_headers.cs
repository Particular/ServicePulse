namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when request has no forwarded headers.
    /// </summary>
    [TestFixture]
    public class When_request_has_no_forwarded_headers
    {
        [SetUp]
        public void SetUp()
        {
            ForwardedHeadersTestStartup.ConfigureDefaults();
        }

        [TearDown]
        public void TearDown()
        {
            ForwardedHeadersTestStartup.Reset();
        }

        [Test]
        public async Task Original_values_should_be_preserved()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                // No forwarded headers added

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Original request values should be used
                Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
                Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
                Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
                Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
            }
        }
    }
}
