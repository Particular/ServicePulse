namespace ServicePulse.Tests.Https;

using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HTTP to HTTPS redirect behavior.
/// </summary>
[TestFixture]
public class When_https_redirect_is_enabled
{
    [Test]
    public async Task Should_redirect_http_to_https()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/some/path");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.StartWith("https://"));
    }

    [Test]
    public async Task Should_not_redirect_https_request()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Should_include_custom_port_in_redirect()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled(httpsPort: 8443);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/test");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain(":8443"));
    }

    [Test]
    public async Task Should_preserve_path_in_redirect()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/some/path");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("/some/path"));
    }

    [Test]
    public async Task Should_preserve_query_string()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/test?foo=bar&baz=qux");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("foo=bar"));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("baz=qux"));
    }

    [Test]
    public async Task Should_use_307_temporary_redirect()
    {
        using var factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var request = new HttpRequestMessage(HttpMethod.Post, "/api/data");
        var response = await client.SendAsync(request);

        // 307 preserves the HTTP method (important for POST, PUT, etc.)
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }
}
