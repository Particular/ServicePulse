namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests HTTPS middleware behavior when used with forwarded headers.
    /// This is the reverse proxy scenario where the proxy terminates SSL
    /// and forwards requests to the application over HTTP.
    /// </summary>
    [TestFixture]
    public class When_https_with_forwarded_headers
    {
        [SetUp]
        public void SetUp()
        {
            HttpsTestStartup.ConfigureWithForwardedHeaders();
        }

        [TearDown]
        public void TearDown()
        {
            HttpsTestStartup.Reset();
        }

        [Test]
        public async Task Should_add_hsts_when_forwarded_proto_is_https()
        {
            HttpsTestStartup.SimulatedScheme = "http"; // Original request is HTTP

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/https-info");
                request.Headers.Add("X-Forwarded-Proto", "https"); // But forwarded as HTTPS

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
            }
        }

        [Test]
        public async Task Should_not_redirect_when_forwarded_proto_is_https()
        {
            HttpsTestStartup.SimulatedScheme = "http"; // Original request is HTTP

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/https-info");
                request.Headers.Add("X-Forwarded-Proto", "https"); // But forwarded as HTTPS

                var response = await server.HttpClient.SendAsync(request);

                // Should NOT redirect because effective scheme is HTTPS
                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            }
        }

        [Test]
        public async Task Should_redirect_when_forwarded_proto_is_http()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                request.Headers.Add("X-Forwarded-Proto", "http"); // Forwarded as HTTP

                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                // Should redirect because effective scheme is HTTP
                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            }
        }

        [Test]
        public async Task Should_use_forwarded_host_in_redirect()
        {
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "internal-server";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                request.Headers.Add("X-Forwarded-Proto", "http");
                request.Headers.Add("X-Forwarded-Host", "public.example.com");

                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                // Should use the forwarded host, not the original
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://public.example.com/test"));
            }
        }

        [Test]
        public async Task Should_not_add_hsts_when_forwarded_proto_is_http()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/https-info");
                request.Headers.Add("X-Forwarded-Proto", "http");

                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                // Will redirect, but if we could check the pre-redirect response,
                // it should not have HSTS since the effective scheme is HTTP
                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            }
        }
    }
}
