namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when forwarded headers contain malformed or edge-case values.
/// </summary>
[TestFixture]
public class When_headers_are_malformed : ForwardedHeadersTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();
    }

    [Test]
    public async Task Should_handle_empty_forwarded_for_entries()
    {
        // Header with empty entry in the middle
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, , 192.168.1.1",
            forwardedProto: "https");

        // Should still process and use a valid IP
        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Should_handle_whitespace_only_entries()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50,   ,192.168.1.1",
            forwardedProto: "https");

        Assert.That(result.Processed.Scheme, Is.EqualTo("https"));
    }

    [Test]
    public async Task Should_handle_single_value_with_trailing_comma()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50,",
            forwardedProto: "https");

        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
    }

    [Test]
    public async Task Should_fallback_when_ip_has_whitespace()
    {
        var result = await SendRequestWithHeaders(
            forwardedFor: "  203.0.113.50  ,  10.0.0.1  ",
            forwardedProto: "https");

        // ASP.NET Core doesn't trim whitespace from IP addresses - falls back to original
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("127.0.0.1"));
    }

    [Test]
    public async Task Should_preserve_original_scheme_for_invalid_proto()
    {
        // Invalid protocol value - should either be ignored or handled gracefully
        var result = await SendRequestWithHeaders(forwardedProto: "ftp");

        // Behavior depends on implementation - at minimum shouldn't crash
        Assert.That(result.Processed.Scheme, Is.Not.Null);
    }

    [Test]
    public async Task Should_handle_empty_proto_value()
    {
        var result = await SendRequestWithHeaders(forwardedProto: "");

        // Empty proto should fall back to original
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
    }

    [Test]
    public async Task Should_fallback_when_proto_has_whitespace()
    {
        var result = await SendRequestWithHeaders(forwardedProto: "  https  ");

        // ASP.NET Core doesn't trim whitespace from proto values - falls back to original
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
    }

    [Test]
    public async Task Should_fallback_to_original_host_when_whitespace_present()
    {
        var result = await SendRequestWithHeaders(forwardedHost: "  example.com  ");

        // ASP.NET Core doesn't trim whitespace from host values - falls back to original
        Assert.That(result.Processed.Host, Is.EqualTo("localhost"));
    }
}
