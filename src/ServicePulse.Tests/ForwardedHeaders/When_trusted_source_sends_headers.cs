namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when headers are sent from a trusted source (known proxy or within a known network).
/// </summary>
[TestFixture]
public class When_trusted_source_sends_headers : ForwardedHeadersTestBase
{
    [TestCase("127.0.0.1", null, TestName = "Known_proxy")]
    [TestCase(null, "127.0.0.0/8", TestName = "Known_network")]
    public async Task Headers_should_be_processed(string? knownProxy, string? knownNetwork)
    {
        // Configure known proxy or network that matches the simulated remote IP (127.0.0.1)
        Factory = knownProxy != null
            ? TestConfiguration.CreateWithKnownProxies(knownProxy)
            : TestConfiguration.CreateWithKnownNetworks(knownNetwork!);
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should be processed since request comes from trusted source
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
        Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Configuration_should_show_known_proxies()
    {
        Factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders();

        Assert.That(result.Configuration.Enabled, Is.True);
        Assert.That(result.Configuration.TrustAllProxies, Is.False);
        Assert.That(result.Configuration.KnownProxies, Does.Contain("127.0.0.1"));
    }

    [Test]
    public async Task Configuration_should_show_known_networks()
    {
        Factory = TestConfiguration.CreateWithKnownNetworks("127.0.0.0/8");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders();

        Assert.That(result.Configuration.Enabled, Is.True);
        Assert.That(result.Configuration.TrustAllProxies, Is.False);
        Assert.That(result.Configuration.KnownNetworks, Does.Contain("127.0.0.0/8"));
    }
}
