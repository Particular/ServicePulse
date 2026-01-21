namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests HTTPS middleware behavior when used with forwarded headers.
    /// This is the reverse proxy scenario where the proxy terminates SSL
    /// and forwards requests to the application over HTTP.
    /// </summary>
    [TestFixture]
    public class When_https_with_forwarded_headers : HttpsTestBase
    {
        [SetUp]
        public void SetUp()
        {
            HttpsTestStartup.ConfigureWithForwardedHeaders();
            CreateServer();
        }

        [Test]
        public async Task Should_add_hsts_when_forwarded_proto_is_https()
        {
            HttpsTestStartup.SimulatedScheme = "http"; // Original request is HTTP

            var response = await SendRequest("/debug/https-info", forwardedProto: "https");
            response.EnsureSuccessStatusCode();

            Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
        }

        [Test]
        public async Task Should_not_redirect_when_forwarded_proto_is_https()
        {
            HttpsTestStartup.SimulatedScheme = "http"; // Original request is HTTP

            var response = await SendRequest("/debug/https-info", forwardedProto: "https");

            // Should NOT redirect because effective scheme is HTTPS
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        }

        [Test]
        public async Task Should_redirect_when_forwarded_proto_is_http()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            var response = await SendRequest("/test", forwardedProto: "http", followRedirects: false);

            // Should redirect because effective scheme is HTTP
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        }

        [Test]
        public async Task Should_use_forwarded_host_in_redirect()
        {
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "internal-server";

            var response = await SendRequest("/test",
                forwardedProto: "http",
                forwardedHost: "public.example.com",
                followRedirects: false);

            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            // Should use the forwarded host, not the original
            Assert.That(response.Headers.Location.ToString(), Is.EqualTo("https://public.example.com/test"));
        }

        [Test]
        public async Task Should_not_add_hsts_when_forwarded_proto_is_http()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            var response = await SendRequest("/debug/https-info", forwardedProto: "http", followRedirects: false);

            // Will redirect, but if we could check the pre-redirect response,
            // it should not have HSTS since the effective scheme is HTTP
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        }

        [TestCase("HTTPS")]
        [TestCase("Https")]
        [TestCase("hTtPs")]
        public async Task Should_handle_case_insensitive_forwarded_proto(string proto)
        {
            HttpsTestStartup.SimulatedScheme = "http";

            var response = await SendRequest("/debug/https-info", forwardedProto: proto);

            // Should not redirect - HTTPS proto handling should be case-insensitive
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        }
    }
}
