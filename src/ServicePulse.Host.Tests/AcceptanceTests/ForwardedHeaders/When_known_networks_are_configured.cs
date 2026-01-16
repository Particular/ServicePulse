namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when known networks (CIDR notation) are configured.
    /// Headers are only processed when the request comes from an IP within a trusted network.
    /// </summary>
    [TestFixture]
    public class When_known_networks_are_configured
    {
        [SetUp]
        public void SetUp()
        {
            // Configure localhost network as trusted (TestServer requests come from localhost)
            ForwardedHeadersTestStartup.ConfigureWithKnownNetworks("127.0.0.0/8", "::1/128");
        }

        [TearDown]
        public void TearDown()
        {
            ForwardedHeadersTestStartup.Reset();
        }

        [Test]
        public async Task Headers_should_be_processed_from_known_network()
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

                // Headers should be processed since request comes from known network
                Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
                Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
                Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
            }
        }

        [Test]
        public async Task Configuration_should_show_known_networks()
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
                Assert.That(result.Configuration.KnownNetworks, Has.Length.GreaterThan(0));
            }
        }
    }
}
