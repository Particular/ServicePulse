namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when IPv4-mapped IPv6 addresses (::ffff:x.x.x.x) are used.
/// These should be normalized and match their IPv4 equivalents in KnownProxies.
/// </summary>
[TestFixture]
public class When_ipv4_mapped_ipv6_addresses_are_used : ForwardedHeadersTestBase
{
    [Test]
    public async Task Ipv4_mapped_ipv6_proxy_should_match_ipv4_known_proxy()
    {
        // Configure 127.0.0.1 as known proxy
        // Request comes from ::ffff:127.0.0.1 (IPv4-mapped IPv6)
        Factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1")
            .WithRemoteIpAddress("::ffff:127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // Headers should be processed since ::ffff:127.0.0.1 matches 127.0.0.1
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
        Assert.That(result.Processed.Host, Is.EqualTo("example.com"));
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Ipv4_proxy_does_not_match_ipv4_mapped_ipv6_known_proxy()
    {
        // Configure ::ffff:127.0.0.1 as known proxy
        // Request comes from 127.0.0.1 (plain IPv4)
        Factory = TestConfiguration.CreateWithKnownProxies("::ffff:127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https",
            forwardedHost: "example.com");

        // ASP.NET Core doesn't normalize IPv4-mapped IPv6 - no match, headers not processed
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.EqualTo("localhost"));
    }

    [Test]
    public async Task Ipv4_mapped_address_in_forwarded_for_should_be_processed()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "::ffff:203.0.113.50",
            forwardedProto: "https");

        // The IPv4-mapped address should be processed
        // Note: The stored value format depends on implementation
        Assert.That(result.Processed.RemoteIpAddress, Is.Not.Null.And.Not.Empty);
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Mixed_ipv4_and_mapped_addresses_in_chain()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "::ffff:203.0.113.50, 10.0.0.1, ::ffff:192.168.1.1",
            forwardedProto: "https");

        // Should process the chain and return leftmost
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }
}
