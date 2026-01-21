namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Threading.Tasks;
    using NUnit.Framework;

    /// <summary>
    /// Tests HSTS (HTTP Strict Transport Security) header behavior.
    /// HSTS should only be added to HTTPS responses.
    /// </summary>
    [TestFixture]
    public class When_hsts_is_enabled : HttpsTestBase
    {
        [Test]
        public async Task Should_add_hsts_header_for_https_request()
        {
            HttpsTestStartup.ConfigureHstsEnabled();
            HttpsTestStartup.SimulatedScheme = "https";
            CreateServer();

            var response = await SendRequest("/debug/https-info");
            response.EnsureSuccessStatusCode();

            Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
            var hstsValue = GetHstsHeaderValue(response);
            Assert.That(hstsValue, Does.Contain("max-age=31536000"));
        }

        [Test]
        public async Task Should_not_add_hsts_header_for_http_request()
        {
            HttpsTestStartup.ConfigureHstsEnabled();
            HttpsTestStartup.SimulatedScheme = "http";
            CreateServer();

            var response = await SendRequest("/debug/https-info");
            response.EnsureSuccessStatusCode();

            Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
        }

        [Test]
        public async Task Should_use_custom_max_age()
        {
            HttpsTestStartup.ConfigureHstsEnabled(maxAgeSeconds: 86400);
            HttpsTestStartup.SimulatedScheme = "https";
            CreateServer();

            var response = await SendRequest("/debug/https-info");
            response.EnsureSuccessStatusCode();

            Assert.That(GetHstsHeaderValue(response), Is.EqualTo("max-age=86400"));
        }

        [Test]
        public async Task Should_include_subdomains_when_configured()
        {
            HttpsTestStartup.ConfigureHstsEnabled(includeSubDomains: true);
            HttpsTestStartup.SimulatedScheme = "https";
            CreateServer();

            var response = await SendRequest("/debug/https-info");
            response.EnsureSuccessStatusCode();

            Assert.That(GetHstsHeaderValue(response), Does.Contain("includeSubDomains"));
        }

        [Test]
        public async Task Should_not_include_subdomains_by_default()
        {
            HttpsTestStartup.ConfigureHstsEnabled(includeSubDomains: false);
            HttpsTestStartup.SimulatedScheme = "https";
            CreateServer();

            var response = await SendRequest("/debug/https-info");
            response.EnsureSuccessStatusCode();

            Assert.That(GetHstsHeaderValue(response), Does.Not.Contain("includeSubDomains"));
        }
    }
}
