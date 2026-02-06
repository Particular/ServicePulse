namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Base class for ForwardedHeaders tests providing common setup, teardown, and helper methods.
/// </summary>
public abstract class ForwardedHeadersTestBase
{
    protected ServicePulseWebApplicationFactory Factory = null!;
    protected HttpClient Client = null!;

    [TearDown]
    public void TearDown()
    {
        Client.Dispose();
        Factory.Dispose();
    }

    protected async Task<DebugRequestInfoResponse> SendRequestWithHeaders(
        string? forwardedFor = null,
        string? forwardedProto = null,
        string? forwardedHost = null)
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

        var response = await Client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<DebugRequestInfoResponse>(content)!;
    }
}
