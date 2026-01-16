namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when specific proxy IP addresses are trusted.
/// </summary>
[TestFixture]
public class When_known_proxies_are_configured
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        // Configure 127.0.0.1 as a known proxy (matches simulated remote IP)
        factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1");
        client = factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        client.Dispose();
        factory.Dispose();
    }

    [Test]
    public async Task Headers_should_be_processed_from_known_proxy()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should be processed since request comes from known proxy
        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
        Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Configuration_should_show_known_proxies()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        Assert.That(result!.Configuration.Enabled, Is.True);
        Assert.That(result.Configuration.TrustAllProxies, Is.False);
        Assert.That(result.Configuration.KnownProxies, Does.Contain("127.0.0.1"));
    }
}
