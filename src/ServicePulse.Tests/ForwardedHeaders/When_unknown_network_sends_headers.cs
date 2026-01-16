namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when headers are sent from an IP outside configured known networks.
/// </summary>
[TestFixture]
public class When_unknown_network_sends_headers
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        // Configure known network as 10.0.0.0/8, but simulate request from 192.168.1.100
        factory = TestConfiguration.CreateWithKnownNetworks("10.0.0.0/8")
            .WithRemoteIpAddress("192.168.1.100");
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

        // Headers should NOT be processed since request doesn't come from known network
        Assert.That(result!.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.Not.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Headers_should_remain_in_request()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50");
        request.Headers.Add("X-Forwarded-Proto", "https");
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Headers should remain unprocessed
        Assert.That(result!.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
        Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
        Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
    }
}
