namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when forwarded headers processing is disabled.
/// </summary>
[TestFixture]
public class When_forwarded_headers_are_disabled
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        factory = TestConfiguration.CreateWithForwardedHeadersDisabled();
        client = factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        client.Dispose();
        factory.Dispose();
    }

    [Test]
    public async Task Headers_should_not_be_processed()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should NOT be processed when disabled
        Assert.That(result!.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
    }

    [Test]
    public async Task Headers_should_remain_unmodified()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should remain in request when disabled
        Assert.That(result!.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
        Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
        Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
    }
}
