namespace ServicePulse.Tests.Https;

using Microsoft.AspNetCore.Mvc.Testing;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HSTS (HTTP Strict Transport Security) header behavior.
/// HSTS requires Production environment (disabled in Development by ASP.NET Core).
/// </summary>
[TestFixture]
public class When_hsts_is_enabled
{
    [Test]
    public async Task Should_add_hsts_header_for_https_request()
    {
        // HSTS requires Production environment
        using var factory = TestConfiguration.CreateWithHstsEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
        var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Does.Contain("max-age=31536000"));
    }

    [Test]
    public async Task Should_not_add_hsts_header_for_http_request()
    {
        using var factory = TestConfiguration.CreateWithHstsEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
    }

    [Test]
    public async Task Should_use_custom_max_age()
    {
        using var factory = TestConfiguration.CreateWithHstsEnabled(maxAgeSeconds: 86400);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Is.EqualTo("max-age=86400"));
    }

    [Test]
    public async Task Should_include_subdomains_when_configured()
    {
        using var factory = TestConfiguration.CreateWithHstsEnabled(includeSubDomains: true);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Does.Contain("includeSubDomains"));
    }

    [Test]
    public async Task Should_not_include_subdomains_by_default()
    {
        using var factory = TestConfiguration.CreateWithHstsEnabled(includeSubDomains: false);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");

        var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Does.Not.Contain("includeSubDomains"));
    }
}
