namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when IPv6 addresses are used in X-Forwarded-For headers.
/// </summary>
[TestFixture]
public class When_ipv6_addresses_are_used : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Should_process_unbracketed_ipv6_address()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "2001:db8::1",
            forwardedProto: "https");

        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("2001:db8::1"));
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Should_process_bracketed_ipv6_address()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "[2001:db8::1]",
            forwardedProto: "https");

        // Brackets should be stripped
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("2001:db8::1"));
    }

    [Test]
    public async Task Should_process_bracketed_ipv6_address_with_port()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "[2001:db8::1]:8080",
            forwardedProto: "https");

        // Should extract just the IPv6 address without brackets or port
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("2001:db8::1"));
    }

    [Test]
    public async Task Should_process_loopback_ipv6_address()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "::1",
            forwardedProto: "https");

        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("::1"));
    }

    [Test]
    public async Task Should_process_ipv6_chain()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "2001:db8::100, 2001:db8::1, ::1",
            forwardedProto: "https");

        // Should use the leftmost (original client) IP
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("2001:db8::100"));
    }

    [Test]
    public async Task Should_process_mixed_ipv4_ipv6_chain()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, 2001:db8::1, 192.168.1.1",
            forwardedProto: "https");

        // Should use the leftmost (original client) IP
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }
}
