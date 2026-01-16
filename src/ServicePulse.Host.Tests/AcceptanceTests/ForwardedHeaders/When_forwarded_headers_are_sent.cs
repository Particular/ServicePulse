namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests default behavior when forwarded headers are sent and all proxies are trusted (default configuration).
    /// Corresponds to Scenario 1/2 in forwarded-headers-testing.md
    /// </summary>
    [TestFixture]
    public class When_forwarded_headers_are_sent
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
        public async Task Headers_should_be_applied_when_trust_all_proxies()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-For", "203.0.113.50");
                request.Headers.Add("X-Forwarded-Proto", "https");
                request.Headers.Add("X-Forwarded-Host", "example.com");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
                Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
                Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
            }
        }

        [Test]
        public async Task Headers_should_be_consumed_after_processing()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-For", "203.0.113.50");
                request.Headers.Add("X-Forwarded-Proto", "https");
                request.Headers.Add("X-Forwarded-Host", "example.com");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Headers should be consumed (removed) after processing
                Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
                Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
                Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
            }
        }
    }
}
