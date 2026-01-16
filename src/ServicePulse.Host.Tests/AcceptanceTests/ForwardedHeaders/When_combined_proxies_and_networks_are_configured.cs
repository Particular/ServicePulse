namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when both known proxies and known networks are configured.
    /// Either match should allow header processing.
    /// </summary>
    [TestFixture]
    public class When_combined_proxies_and_networks_are_configured
    {
        [SetUp]
        public void SetUp()
        {
            // Configure both localhost IP and localhost network as trusted
            ForwardedHeadersTestStartup.ConfigureWithKnownProxiesAndNetworks(
                new[] { "127.0.0.1" },
                new[] { "::1/128" }
            );
        }

        [TearDown]
        public void TearDown()
        {
            ForwardedHeadersTestStartup.Reset();
        }

        [Test]
        public async Task Headers_should_be_processed_when_matching_proxy()
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

                // Should work when request matches either proxy or network
                Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
                Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
                Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
            }
        }

        [Test]
        public async Task Configuration_should_show_both_proxies_and_networks()
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
                Assert.That(result.Configuration.KnownNetworks, Has.Length.GreaterThan(0));
            }
        }
    }
}
