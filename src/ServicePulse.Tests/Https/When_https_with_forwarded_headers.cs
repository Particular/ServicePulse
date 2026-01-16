namespace ServicePulse.Tests.Https;

using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HTTPS behavior when behind a reverse proxy using forwarded headers.
/// This simulates scenarios where TLS termination happens at the proxy.
///
/// Note: ASP.NET Core's UseHsts middleware adds HSTS header based on the processed scheme
/// after ForwardedHeaders middleware has run.
/// </summary>
[TestFixture]
public class When_https_with_forwarded_headers
{
    [Test]
    public async Task Should_not_redirect_when_forwarded_proto_is_https()
    {
        using var factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var request = new HttpRequestMessage(HttpMethod.Get, "/js/app.constants.js");
        request.Headers.Add("X-Forwarded-Proto", "https");

        var response = await client.SendAsync(request);

        // Should not redirect because effective scheme is already HTTPS (from forwarded header)
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Should_redirect_when_no_forwarded_proto()
    {
        using var factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var request = new HttpRequestMessage(HttpMethod.Get, "/test");
        // No X-Forwarded-Proto header - original scheme is HTTP

        var response = await client.SendAsync(request);

        // Should redirect because effective scheme is HTTP
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }

    [Test]
    public async Task Should_use_forwarded_host_in_redirect_when_http()
    {
        using var factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var request = new HttpRequestMessage(HttpMethod.Get, "/test");
        // No X-Forwarded-Proto - will redirect from HTTP to HTTPS
        request.Headers.Add("X-Forwarded-Host", "example.com");

        var response = await client.SendAsync(request);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("example.com"));
    }

    [Test]
    public async Task Should_add_hsts_when_request_is_https()
    {
        // When using HTTPS directly (not forwarded), HSTS should be added
        using var factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");
        response.EnsureSuccessStatusCode();

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
    }

    [Test]
    public async Task Redirect_should_preserve_path()
    {
        using var factory = TestConfiguration.CreateWithForwardedHeadersAndHttps();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var request = new HttpRequestMessage(HttpMethod.Get, "/some/path");
        // No X-Forwarded-Proto - will redirect

        var response = await client.SendAsync(request);

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("/some/path"));
    }
}
