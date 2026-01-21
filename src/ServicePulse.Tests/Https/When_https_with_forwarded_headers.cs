namespace ServicePulse.Tests.Https;

using System.Net;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HTTPS behavior when behind a reverse proxy using forwarded headers.
/// This simulates scenarios where TLS termination happens at the proxy.
///
/// Note: ASP.NET Core's UseHsts middleware adds HSTS header based on the processed scheme
/// after ForwardedHeaders middleware has run.
/// </summary>
[TestFixture]
public class When_https_with_forwarded_headers : HttpsTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        Client = CreateHttpClient(allowAutoRedirect: false);
    }

    [Test]
    public async Task Should_not_redirect_when_forwarded_proto_is_https()
    {
        var response = await SendHttpRequest("/js/app.constants.js", forwardedProto: "https");

        // Should not redirect because effective scheme is already HTTPS (from forwarded header)
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Should_redirect_when_no_forwarded_proto()
    {
        var response = await SendHttpRequest("/test");

        // Should redirect because effective scheme is HTTP
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }

    [Test]
    public async Task Should_use_forwarded_host_in_redirect_when_http()
    {
        var response = await SendHttpRequest("/test", forwardedHost: "example.com");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("example.com"));
    }

    [Test]
    public async Task Should_add_hsts_when_request_is_https()
    {
        // When using HTTPS directly (not forwarded), HSTS should be added
        using var httpsClient = CreateHttpsClient();

        var response = await httpsClient.GetAsync("/js/app.constants.js");
        response.EnsureSuccessStatusCode();

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
    }

    [Test]
    public async Task Redirect_should_preserve_path()
    {
        var response = await SendHttpRequest("/some/path");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("/some/path"));
    }

    [Test]
    public async Task Should_add_hsts_when_forwarded_proto_is_https()
    {
        // HSTS should be added when the effective scheme is HTTPS via X-Forwarded-Proto
        var response = await SendHttpRequest("/js/app.constants.js", forwardedProto: "https");

        response.EnsureSuccessStatusCode();
        Assert.That(GetHstsHeaderValue(response), Is.Not.Null);
    }

    [TestCase("HTTPS")]
    [TestCase("Https")]
    [TestCase("hTtPs")]
    public async Task Should_handle_case_insensitive_forwarded_proto(string proto)
    {
        var response = await SendHttpRequest("/js/app.constants.js", forwardedProto: proto);

        // Should not redirect - HTTPS proto handling should be case-insensitive
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Should_redirect_when_forwarded_proto_is_http()
    {
        var response = await SendHttpRequest("/test", forwardedProto: "http");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }
}
