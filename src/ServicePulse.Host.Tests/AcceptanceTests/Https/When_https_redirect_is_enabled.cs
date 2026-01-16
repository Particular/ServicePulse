namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests HTTP to HTTPS redirect behavior.
    /// HTTP requests should be redirected with 307 status code.
    /// </summary>
    [TestFixture]
    public class When_https_redirect_is_enabled
    {
        [TearDown]
        public void TearDown()
        {
            HttpsTestStartup.Reset();
        }

        [Test]
        public async Task Should_redirect_http_to_https()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                // Disable auto-redirect to capture the redirect response
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/some/path");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/some/path"));
            }
        }

        [Test]
        public async Task Should_not_redirect_https_request()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            }
        }

        [Test]
        public async Task Should_include_custom_port_in_redirect()
        {
            HttpsTestStartup.ConfigureRedirectEnabled(httpsPort: 8443);
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com:8443/test"));
            }
        }

        [Test]
        public async Task Should_omit_default_https_port()
        {
            HttpsTestStartup.ConfigureRedirectEnabled(httpsPort: 443);
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test"));
                Assert.That(response.Headers.Location.ToString(), Does.Not.Contain(":443"));
            }
        }

        [Test]
        public async Task Should_preserve_query_string()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test?foo=bar&baz=qux");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test?foo=bar&baz=qux"));
            }
        }

        [Test]
        public async Task Should_strip_port_from_host()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com:8080";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test"));
            }
        }

        [Test]
        public async Task Should_use_307_temporary_redirect()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Post, "/api/data");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                // 307 preserves the HTTP method (important for POST, PUT, etc.)
                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            }
        }
    }
}
