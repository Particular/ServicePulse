namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when HTTPS features are disabled.
    /// No HSTS header should be added and no redirects should occur.
    /// </summary>
    [TestFixture]
    public class When_https_is_disabled
    {
        [SetUp]
        public void SetUp()
        {
            HttpsTestStartup.ConfigureDisabled();
        }

        [TearDown]
        public void TearDown()
        {
            HttpsTestStartup.Reset();
        }

        [Test]
        public async Task Should_not_add_hsts_header()
        {
            HttpsTestStartup.SimulatedScheme = "https";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
            }
        }

        [Test]
        public async Task Should_not_redirect_http_request()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");

                Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
                Assert.That(response.Headers.Location, Is.Null);
            }
        }

        [Test]
        public async Task Should_pass_through_to_next_middleware()
        {
            HttpsTestStartup.SimulatedScheme = "http";

            using (var server = TestServer.Create<HttpsTestStartup>())
            {
                var response = await server.HttpClient.GetAsync("/debug/https-info");
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                Assert.That(content, Does.Contain("\"scheme\": \"http\""));
            }
        }
    }
}
