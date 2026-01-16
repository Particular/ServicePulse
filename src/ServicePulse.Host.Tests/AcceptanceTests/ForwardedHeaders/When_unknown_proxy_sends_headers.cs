namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when headers are sent from an untrusted proxy.
    /// When known proxies are configured but request doesn't come from one, headers should be ignored.
    /// </summary>
    [TestFixture]
    public class When_unknown_proxy_sends_headers
    {
        [SetUp]
        public void SetUp()
        {
            // Configure known proxy as 10.0.0.1, but simulate request from 192.168.1.100
            // This means the request will be considered from an unknown proxy
            ForwardedHeadersTestStartup.ConfigureWithUnknownProxy();
        }

        [TearDown]
        public void TearDown()
        {
            ForwardedHeadersTestStartup.Reset();
        }

        [Test]
        public async Task Headers_should_not_be_processed()
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

                // Headers should NOT be processed since request doesn't come from known proxy
                Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
                Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
                Assert.That(result.Processed.RemoteIpAddress, Is.Not.EqualTo("203.0.113.50"));
            }
        }

        [Test]
        public async Task Headers_should_remain_in_request()
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

                // Headers should remain unprocessed when from untrusted source
                Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
                Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
                Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
            }
        }
    }
}
