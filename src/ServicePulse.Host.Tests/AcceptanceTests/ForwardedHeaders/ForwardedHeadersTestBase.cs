namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Net.Http;
    using System.Text.Json;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Base class for forwarded headers acceptance tests providing common setup, teardown, and helper methods.
    /// </summary>
    public abstract class ForwardedHeadersTestBase
    {
        protected TestServer Server;

        [TearDown]
        public void TearDown()
        {
            Server?.Dispose();
            ForwardedHeadersTestStartup.Reset();
        }

        protected void CreateServer()
        {
            Server = TestServer.Create<ForwardedHeadersTestStartup>();
        }

        protected async Task<DebugRequestInfoResponse> SendRequestWithHeaders(
            string forwardedFor = null,
            string forwardedProto = null,
            string forwardedHost = null,
            CancellationToken cancellationToken = default)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");

            if (forwardedFor != null)
            {
                request.Headers.Add("X-Forwarded-For", forwardedFor);
            }
            if (forwardedProto != null)
            {
                request.Headers.Add("X-Forwarded-Proto", forwardedProto);
            }
            if (forwardedHost != null)
            {
                request.Headers.Add("X-Forwarded-Host", forwardedHost);
            }

            var response = await Server.HttpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);
        }
    }
}
