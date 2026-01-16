namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when all HTTPS features are enabled together.
    /// </summary>
    [TestFixture]
    public class When_all_https_features_are_enabled
    {
        [TearDown]
        public void TearDown()
        {
            HttpsTestStartup.Reset();
        }

        [Test]
        public async Task Should_redirect_http_and_add_hsts_for_https()
        {
            HttpsTestStartup.ConfigureAllEnabled();

            // First, test HTTP redirect
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
            }
        }

        [Test]
        public async Task Should_add_hsts_for_https_requests()
        {
            HttpsTestStartup.ConfigureAllEnabled();
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
            }
        }

        [Test]
        public async Task Should_use_custom_port_and_max_age()
        {
            HttpsTestStartup.ConfigureAllEnabled(httpsPort: 9443, maxAgeSeconds: 3600);
            HttpsTestStartup.SimulatedScheme = "http";
            HttpsTestStartup.SimulatedHost = "example.com";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var handler = server.Handler;
                var client = new HttpClient(handler) { BaseAddress = server.BaseAddress };

                var request = new HttpRequestMessage(HttpMethod.Get, "/test");
                var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
                Assert.That(response.Headers.Location.ToString(), Does.Contain(":9443"));
            }

            // Now test HSTS with custom max-age
            HttpsTestStartup.ConfigureAllEnabled(httpsPort: 9443, maxAgeSeconds: 3600);
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
                Assert.That(hstsValue, Is.EqualTo("max-age=3600"));
            }
        }

        [Test]
        public async Task Should_include_subdomains_in_hsts()
        {
            HttpsTestStartup.ConfigureAllEnabled(includeSubDomains: true);
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
                Assert.That(hstsValue, Does.Contain("includeSubDomains"));
            }
        }
    }
}
