namespace ServicePulse.Host.Tests.AcceptanceTests.Https
{
    using System.Net.Http;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Owin.Testing;
    using NUnit.Framework;

    /// <summary>
    /// Base class for HTTPS acceptance tests providing common setup, teardown, and helper methods.
    /// </summary>
    public abstract class HttpsTestBase
    {
        protected TestServer Server;

        [TearDown]
        public void TearDown()
        {
            Server?.Dispose();
            HttpsTestStartup.Reset();
        }

        protected void CreateServer()
        {
            Server = TestServer.Create<HttpsTestStartup>();
        }

        /// <summary>
        /// Creates an HttpClient that does NOT follow redirects (to test redirect behavior).
        /// </summary>
        protected HttpClient CreateNonRedirectingClient()
        {
            return new HttpClient(Server.Handler) { BaseAddress = Server.BaseAddress };
        }

        /// <summary>
        /// Sends a request and returns the response, optionally with forwarded headers.
        /// </summary>
        protected async Task<HttpResponseMessage> SendRequest(
            string path,
            HttpMethod method = null,
            string forwardedProto = null,
            string forwardedHost = null,
            bool followRedirects = true,
            CancellationToken cancellationToken = default)
        {
            var request = new HttpRequestMessage(method ?? HttpMethod.Get, path);

            if (forwardedProto != null)
            {
                request.Headers.Add("X-Forwarded-Proto", forwardedProto);
            }
            if (forwardedHost != null)
            {
                request.Headers.Add("X-Forwarded-Host", forwardedHost);
            }

            if (followRedirects)
            {
                return await Server.HttpClient.SendAsync(request, cancellationToken);
            }
            else
            {
                using (var client = CreateNonRedirectingClient())
                {
                    return await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
                }
            }
        }

        protected static string GetHstsHeaderValue(HttpResponseMessage response)
        {
            if (response.Headers.Contains("Strict-Transport-Security"))
            {
                return string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
            }
            return null;
        }
    }
}
