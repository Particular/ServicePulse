namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when specific known proxies are configured.
    /// Headers are only processed when the request comes from a trusted proxy.
    /// </summary>
    [TestFixture]
    public class When_known_proxies_are_configured
    {
        [SetUp]
        public void SetUp()
        {
            // Configure localhost as a known proxy (TestServer requests come from localhost)
            ForwardedHeadersTestStartup.ConfigureWithKnownProxies("127.0.0.1", "::1");
        }

        [TearDown]
        public void TearDown()
        {
            ForwardedHeadersTestStartup.Reset();
        }

        [Test]
        public async Task Headers_should_be_processed_from_known_proxy()
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

                // Headers should be processed since request comes from known proxy (localhost)
                Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
                Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
                Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
            }
        }

        [Test]
        public async Task Configuration_should_show_known_proxies()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                Assert.That(result.Configuration.Enabled, Is.True);
                Assert.That(result.Configuration.TrustAllProxies, Is.False);
                Assert.That(result.Configuration.KnownProxies, Has.Length.GreaterThan(0));
            }
        }
    }
}
