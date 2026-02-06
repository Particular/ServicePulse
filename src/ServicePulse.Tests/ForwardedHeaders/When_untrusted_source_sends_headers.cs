namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when headers are sent from an untrusted source (neither a known proxy nor within a known network).
/// </summary>
[TestFixture]
public class When_untrusted_source_sends_headers : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        // Default setup - will be overridden by test cases
    }

    [TestCase("10.0.0.1", null, TestName = "Unknown_proxy")]
    [TestCase(null, "10.0.0.0/8", TestName = "Unknown_network")]
    public async Task Headers_should_not_be_processed(string? knownProxy, string? knownNetwork)
    {
        // Configure known proxy or network that doesn't match the simulated remote IP
        Factory = knownProxy != null
            ? TestConfiguration.CreateWithKnownProxies(knownProxy).WithRemoteIpAddress("192.168.1.100")
            : TestConfiguration.CreateWithKnownNetworks(knownNetwork!).WithRemoteIpAddress("192.168.1.100");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should NOT be processed since request doesn't come from trusted source
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.Not.EqualTo("203.0.113.50"));
    }

    [TestCase("10.0.0.1", null, TestName = "Unknown_proxy")]
    [TestCase(null, "10.0.0.0/8", TestName = "Unknown_network")]
    public async Task Headers_should_remain_in_request(string? knownProxy, string? knownNetwork)
    {
        Factory = knownProxy != null
            ? TestConfiguration.CreateWithKnownProxies(knownProxy).WithRemoteIpAddress("192.168.1.100")
            : TestConfiguration.CreateWithKnownNetworks(knownNetwork!).WithRemoteIpAddress("192.168.1.100");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should remain unprocessed when from untrusted source
        Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
        Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
        Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
    }
}
