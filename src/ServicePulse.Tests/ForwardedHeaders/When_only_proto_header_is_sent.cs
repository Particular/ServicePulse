namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when only the X-Forwarded-Proto header is sent.
/// </summary>
[TestFixture]
public class When_only_proto_header_is_sent : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Scheme_should_be_updated()
    {
        // Only X-Forwarded-Proto, no X-Forwarded-For or X-Forwarded-Host
        var result = await SendRequestWithHeaders(forwardedProto: "https");

        // Scheme should be updated
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Host_and_ip_should_use_original_values()
    {
        // Only X-Forwarded-Proto, no X-Forwarded-For or X-Forwarded-Host
        var result = await SendRequestWithHeaders(forwardedProto: "https");

        // Host and IP should remain original
        Assert.That(result.Processed.Host, Does.Contain("localhost"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("127.0.0.1"));
    }
}
