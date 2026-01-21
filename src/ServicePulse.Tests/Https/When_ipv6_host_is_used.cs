namespace ServicePulse.Tests.Https;

using System.Net;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HTTPS redirect behavior with IPv6 addresses.
/// IPv6 addresses in Host headers must be bracketed: [::1]
/// </summary>
[TestFixture]
public class When_ipv6_host_is_used : HttpsTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        Client = CreateHttpClient(allowAutoRedirect: false);
    }

    [Test]
    public async Task Should_redirect_to_https_with_ipv6_host()
    {
        var response = await SendHttpRequest("/test", forwardedHost: "[::1]");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.StartWith("https://[::1]"));
    }

    [Test]
    public async Task Should_preserve_ipv6_address_format_in_redirect()
    {
        var response = await SendHttpRequest("/test", forwardedHost: "[2001:db8::1]");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("[2001:db8::1]"));
    }

    [Test]
    public async Task Should_handle_ipv6_with_port_in_redirect()
    {
        Factory.Dispose();
        Client.Dispose();

        Factory = TestConfiguration.CreateWithHttpsRedirectEnabled(httpsPort: 8443);
        Client = CreateHttpClient(allowAutoRedirect: false);

        var response = await SendHttpRequest("/test", forwardedHost: "[::1]");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        // IPv6 with port should be [::1]:8443
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("[::1]:8443"));
    }

    [Test]
    public async Task Should_strip_port_from_ipv6_host_before_redirect()
    {
        // Host header with IPv6 and port: [::1]:8080
        // Should redirect to HTTPS without duplicating port handling
        var response = await SendHttpRequest("/test", forwardedHost: "[::1]:8080");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        // The redirect should use the HTTPS port (443 by default, omitted)
        Assert.That(response.Headers.Location?.ToString(), Does.StartWith("https://[::1]"));
    }

    [Test]
    public async Task Should_handle_ipv4_mapped_ipv6_in_host()
    {
        var response = await SendHttpRequest("/test", forwardedHost: "[::ffff:127.0.0.1]");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("[::ffff:127.0.0.1]"));
    }
}
