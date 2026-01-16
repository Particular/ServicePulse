namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when multiple proxy addresses are in the X-Forwarded-For header (proxy chain).
    /// The rightmost (last) entry should be used as it represents the most recent proxy.
    /// </summary>
    [TestFixture]
    public class When_proxy_chain_headers_are_sent
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
        public async Task Should_use_rightmost_ip_from_chain()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                // Proxy chain: client -> proxy1 -> proxy2 -> server
                // X-Forwarded-For format: client, proxy1 (rightmost is added by most recent hop)
                request.Headers.Add("X-Forwarded-For", "203.0.113.50, 10.0.0.1, 192.168.1.1");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // With ForwardLimit=1 (default), should use rightmost entry
                Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("192.168.1.1"));
            }
        }

        [Test]
        public async Task Should_use_rightmost_proto_from_chain()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-Proto", "https, http");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Should use rightmost protocol
                Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
            }
        }

        [Test]
        public async Task Should_use_rightmost_host_from_chain()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-Host", "first.example.com, second.example.com");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Should use rightmost host
                Assert.That(result.Processed.Host, Is.EqualTo("second.example.com"));
            }
        }

        [Test]
        public async Task Should_consume_only_processed_entries()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-For", "203.0.113.50, 10.0.0.1, 192.168.1.1");
                request.Headers.Add("X-Forwarded-Proto", "https, http");
                request.Headers.Add("X-Forwarded-Host", "first.example.com, second.example.com");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Remaining entries after processing (ForwardLimit=1)
                Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50, 10.0.0.1"));
                Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
                Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("first.example.com"));
            }
        }
    }
}
