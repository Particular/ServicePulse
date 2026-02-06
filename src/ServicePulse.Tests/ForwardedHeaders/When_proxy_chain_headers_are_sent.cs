namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when proxy chain headers contain multiple values.
/// ASP.NET Core's ForwardedHeaders middleware uses the FIRST (leftmost) value
/// when processing comma-separated header values.
/// </summary>
[TestFixture]
public class When_proxy_chain_headers_are_sent : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Should_use_leftmost_ip_from_chain()
    {
        // Leftmost is original client, rightmost is the most recent proxy
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1",
            forwardedProto: "https");

        // ASP.NET Core processes the chain from right to left and ends with the leftmost client IP
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Should_use_first_proto_from_chain()
    {
        // ASP.NET Core uses the first value in comma-separated list
        var result = await SendRequestWithHeaders(forwardedProto: "https, http");

        // Should use the first (leftmost) protocol value
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Should_use_first_host_from_chain()
    {
        // ASP.NET Core uses the first value in comma-separated list
        var result = await SendRequestWithHeaders(forwardedHost: "public.example.com, proxy.internal, original.com");

        // Should use the first (leftmost) host value
        Assert.That(result.Processed.Host, Is.EqualTo("public.example.com"));
    }
}
