namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when no forwarded headers are present in the request.
/// </summary>
[TestFixture]
public class When_request_has_no_forwarded_headers : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Original_values_should_be_preserved()
    {
        // No forwarded headers
        var result = await SendRequestWithHeaders();

        // Original values should be used
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Does.Contain("localhost"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("127.0.0.1"));
    }
}
