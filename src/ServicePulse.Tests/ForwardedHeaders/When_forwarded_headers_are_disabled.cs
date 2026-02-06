namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when forwarded headers processing is disabled.
/// </summary>
[TestFixture]
public class When_forwarded_headers_are_disabled : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDisabled();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Headers_should_not_be_processed()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should NOT be processed when disabled
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.Not.EqualTo("example.com"));
    }

    [Test]
    public async Task Headers_should_remain_unmodified()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should remain in request when disabled
        Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50"));
        Assert.That(result.RawHeaders.XForwardedProto, Is.EqualTo("https"));
        Assert.That(result.RawHeaders.XForwardedHost, Is.EqualTo("example.com"));
    }
}
