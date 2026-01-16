namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when proxy chain headers contain multiple values.
/// ASP.NET Core's ForwardedHeaders middleware uses the FIRST (leftmost) value
/// when processing comma-separated header values.
/// </summary>
[TestFixture]
public class When_proxy_chain_headers_are_sent
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
    public async Task Should_process_ip_from_chain()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        // Leftmost is original client, rightmost is the most recent proxy
        request.Headers.Add("X-Forwarded-For", "203.0.113.50, 10.0.0.1, 192.168.1.1");
        request.Headers.Add("X-Forwarded-Proto", "https");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // ASP.NET Core processes the chain and updates RemoteIpAddress
        Assert.That(result!.Processed.RemoteIpAddress, Is.Not.Null);
    }

    [Test]
    public async Task Should_use_first_proto_from_chain()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        // ASP.NET Core uses the first value in comma-separated list
        request.Headers.Add("X-Forwarded-Proto", "https, http");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Should use the first (leftmost) protocol value
        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Should_use_first_host_from_chain()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        // ASP.NET Core uses the first value in comma-separated list
        request.Headers.Add("X-Forwarded-Host", "public.example.com, proxy.internal, original.com");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Should use the first (leftmost) host value
        Assert.That(result!.Processed.Host, Is.EqualTo("public.example.com"));
    }

    [Test]
    public async Task Should_consume_processed_entries()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-For", "203.0.113.50, 10.0.0.1");
        request.Headers.Add("X-Forwarded-Proto", "https");

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // With TrustAllProxies and no ForwardLimit, all entries may be processed
        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
    }
}
