namespace ServicePulse.Tests.ForwardedHeaders;

using System.Text.Json;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when no forwarded headers are present in the request.
/// </summary>
[TestFixture]
public class When_request_has_no_forwarded_headers
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
    public async Task Original_values_should_be_preserved()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/debug/request-info");
        // No forwarded headers added

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<DebugRequestInfoResponse>(content);

        // Original values should be used
        Assert.That(result!.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Does.Contain("localhost"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("127.0.0.1"));
    }
}
