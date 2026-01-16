namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when specific networks (CIDR notation) are trusted.
/// </summary>
[TestFixture]
public class When_known_networks_are_configured
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        // Configure 127.0.0.0/8 as a known network (includes simulated remote IP 127.0.0.1)
        factory = TestConfiguration.CreateWithKnownNetworks("127.0.0.0/8");
        client = factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        client.Dispose();
        factory.Dispose();
    }

    [Test]
    public async Task Headers_should_be_processed_from_known_network()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should be processed since request comes from known network
        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
        Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Configuration_should_show_known_networks()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        Assert.That(result!.Configuration.Enabled, Is.True);
        Assert.That(result.Configuration.TrustAllProxies, Is.False);
        Assert.That(result.Configuration.KnownNetworks, Does.Contain("127.0.0.0/8"));
    }
}
