namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests HSTS (HTTP Strict Transport Security) header behavior.
    /// HSTS should only be added to HTTPS responses.
    /// </summary>
    [TestFixture]
    public class When_hsts_is_enabled
    {
        [TearDown]
        public void TearDown()
        {
            HttpsTestStartup.Reset();
        }

        [Test]
        public async Task Should_add_hsts_header_for_https_request()
        {
            HttpsTestStartup.ConfigureHstsEnabled();
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
                var hstsValue = response.Headers.GetValues("Strict-Transport-Security");
                Assert.That(hstsValue, Does.Contain("max-age=31536000"));
            }
        }

        [Test]
        public async Task Should_not_add_hsts_header_for_http_request()
        {
            HttpsTestStartup.ConfigureHstsEnabled();
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
            }
        }

        [Test]
        public async Task Should_use_custom_max_age()
        {
            HttpsTestStartup.ConfigureHstsEnabled(maxAgeSeconds: 86400);
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
                Assert.That(hstsValue, Is.EqualTo("max-age=86400"));
            }
        }

        [Test]
        public async Task Should_include_subdomains_when_configured()
        {
            HttpsTestStartup.ConfigureHstsEnabled(includeSubDomains: true);
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
                Assert.That(hstsValue, Does.Contain("includeSubDomains"));
            }
        }

        [Test]
        public async Task Should_not_include_subdomains_by_default()
        {
            HttpsTestStartup.ConfigureHstsEnabled(includeSubDomains: false);
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
                Assert.That(hstsValue, Does.Not.Contain("includeSubDomains"));
            }
        }
    }
}
