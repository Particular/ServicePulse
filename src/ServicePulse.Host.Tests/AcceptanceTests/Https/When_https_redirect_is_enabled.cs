namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests HTTP to HTTPS redirect behavior.
    /// HTTP requests should be redirected with 307 status code.
    /// </summary>
    [TestFixture]
    public class When_https_redirect_is_enabled : HttpsTestBase
    {
        [Test]
        public async Task Should_redirect_http_to_https()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";
            CreateServer();

            var response = await SendRequest("/some/path", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/some/path"));
        }

        [Test]
        public async Task Should_not_redirect_https_request()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "https";
            CreateServer();

            var response = await SendRequest("/debug/https-info");

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        }

        [Test]
        public async Task Should_include_custom_port_in_redirect()
        {
            HttpsTestStartup.ConfigureRedirectEnabled(httpsPort: 8443);
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";
            CreateServer();

            var response = await SendRequest("/test", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com:8443/test"));
        }

        [Test]
        public async Task Should_omit_default_https_port()
        {
            HttpsTestStartup.ConfigureRedirectEnabled(httpsPort: 443);
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";
            CreateServer();

            var response = await SendRequest("/test", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test"));
            Assert.That(response.Headers.Location.ToString(), Does.Not.Contain(":443"));
        }

        [Test]
        public async Task Should_preserve_query_string()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";
            CreateServer();

            var response = await SendRequest("/test?foo=bar&baz=qux", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test?foo=bar&baz=qux"));
        }

        [Test]
        public async Task Should_strip_port_from_host()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com:8080";
            CreateServer();

            var response = await SendRequest("/test", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://example.com/test"));
        }

        [Test]
        public async Task Should_use_307_temporary_redirect()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            CreateServer();

            var response = await SendRequest("/api/data", method: HttpMethod.Post, followRedirects: false);

            // 307 preserves the HTTP method (important for POST, PUT, etc.)
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        }

        [Test]
        public async Task Should_handle_ipv6_host_in_redirect()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "[::1]";
            CreateServer();

            var response = await SendRequest("/test", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Does.StartWith("https://[::1]"));
        }

        [Test]
        public async Task Should_strip_port_from_ipv6_host()
        {
            HttpsTestStartup.ConfigureRedirectEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "[::1]:8080";
            CreateServer();

            var response = await SendRequest("/test", followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            Assert.That(response.Headers.Location.ToString(), Does.StartWith("https://[::1]"));
            Assert.That(response.Headers.Location.ToString(), Does.Not.Contain(":8080"));
        }
    }
}
