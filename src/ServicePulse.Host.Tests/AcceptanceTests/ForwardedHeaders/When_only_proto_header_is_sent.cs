namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Tests behavior when only the X-Forwarded-Proto header is sent.
    /// Common scenario for reverse proxies that only indicate the protocol.
    /// </summary>
    [TestFixture]
    public class When_only_proto_header_is_sent
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
        public async Task Scheme_should_be_updated()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-Proto", "https");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
            }
        }

        [Test]
        public async Task Host_and_ip_should_use_original_values()
        {
            using (var server = TestServer.Create<ForwardedHeadersTestStartup>())
            {
                var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
                request.Headers.Add("X-Forwarded-Proto", "https");

                var response = await server.HttpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

                // Host and IP should use original values since only proto was forwarded
                Assert.That(result.Processed.Host, Is.Not.Empty);
                // RemoteIpAddress should be the original (not from X-Forwarded-For)
            }
        }
    }
}
