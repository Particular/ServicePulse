namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when only the X-Forwarded-Proto header is sent.
/// </summary>
[TestFixture]
public class When_only_proto_header_is_sent
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
    public async Task Scheme_should_be_updated()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-Proto", "https");
        // No X-Forwarded-For or X-Forwarded-Host

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Scheme should be updated
        Assert.That(result!.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Host_and_ip_should_use_original_values()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        request.Headers.Add("X-Forwarded-Proto", "https");
        // No X-Forwarded-For or X-Forwarded-Host

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Host and IP should remain original
        Assert.That(result!.Processed.Host, Does.Contain("localhost"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("127.0.0.1"));
    }
}
