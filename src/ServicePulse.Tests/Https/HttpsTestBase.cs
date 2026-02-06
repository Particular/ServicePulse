namespace ServicePulse.Tests.Https;

using Microsoft.AspNetCore.Mvc.Testing;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Base class for HTTPS tests providing common setup, teardown, and helper methods.
/// </summary>
public abstract class HttpsTestBase
{
    protected ServicePulseWebApplicationFactory Factory = null!;
    protected HttpClient Client = null!;

    [TearDown]
    public void TearDown()
    {
        Client?.Dispose();
        Factory?.Dispose();
    }

    protected HttpClient CreateHttpClient(bool allowAutoRedirect = true)
    {
        return Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = allowAutoRedirect,
            BaseAddress = new Uri("http://localhost")
        });
    }

    protected HttpClient CreateHttpsClient(bool allowAutoRedirect = true)
    {
        return Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = allowAutoRedirect,
            BaseAddress = new Uri("https://localhost")
        });
    }

    protected async Task<HttpResponseMessage> SendHttpRequest(
        string path,
        HttpMethod? method = null,
        string? forwardedProto = null,
        string? forwardedHost = null)
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

        return await Client.SendAsync(request);
    }

    protected static string? GetHstsHeaderValue(HttpResponseMessage response)
    {
        if (response.Headers.Contains("Strict-Transport-Security"))
        {
            return string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        }
        return null;
    }
}
