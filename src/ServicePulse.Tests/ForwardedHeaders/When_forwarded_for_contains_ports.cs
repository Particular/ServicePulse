namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when X-Forwarded-For header contains IP addresses with port numbers.
/// </summary>
[TestFixture]
public class When_forwarded_for_contains_ports : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Should_strip_port_from_ipv4_address()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50:8080",
            forwardedProto: "https");

        // Port should be stripped, leaving just the IP
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Should_strip_port_from_ipv6_address()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "[2001:db8::1]:443",
            forwardedProto: "https");

        // Port and brackets should be stripped
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("2001:db8::1"));
    }

    [Test]
    public async Task Should_handle_mixed_ports_in_chain()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50:12345, 10.0.0.1:8080, 192.168.1.1",
            forwardedProto: "https");

        // Should use leftmost IP with port stripped
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Should_handle_address_without_port()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https");

        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }
}
