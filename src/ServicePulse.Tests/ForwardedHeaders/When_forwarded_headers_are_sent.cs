namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests default behavior when forwarded headers are sent and all proxies are trusted.
/// </summary>
[TestFixture]
public class When_forwarded_headers_are_sent
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        client = factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        client.Dispose();
        factory.Dispose();
    }

    [Test]
    public async Task Headers_should_be_applied_when_trust_all_proxies()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
        Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Headers_should_be_consumed_after_processing()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should be consumed (removed) after processing
        Assert.That(result!.RawHeaders.XForwardedFor, Is.Empty);
        Assert.That(result.RawHeaders.XForwardedProto, Is.Empty);
        Assert.That(result.RawHeaders.XForwardedHost, Is.Empty);
    }
}
