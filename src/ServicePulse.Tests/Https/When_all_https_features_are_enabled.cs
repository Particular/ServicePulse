namespace ServicePulse.Tests.Https;

using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when all HTTPS features are enabled together.
/// </summary>
[TestFixture]
public class When_all_https_features_are_enabled
{
    [Test]
    public async Task Should_redirect_http_request()
    {
        using var factory = TestConfiguration.CreateWithAllHttpsEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var response = await client.GetAsync("/test");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }

    [Test]
    public async Task Should_add_hsts_for_https_requests()
    {
        using var factory = TestConfiguration.CreateWithAllHttpsEnabled();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");
        response.EnsureSuccessStatusCode();

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.True);
    }

    [Test]
    public async Task Should_use_custom_port_and_max_age()
    {
        // First, test HTTP redirect with custom port
        using var factory = TestConfiguration.CreateWithAllHttpsEnabled(httpsPort: 9443, maxAgeSeconds: 3600);
        using var httpClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost")
        });

        var redirectResponse = await httpClient.GetAsync("/test");

        Assert.That(redirectResponse.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(redirectResponse.Headers.Location?.ToString(), Does.Contain(":9443"));

        // Now test HSTS with custom max-age
        using var httpsClient = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var httpsResponse = await httpsClient.GetAsync("/js/app.constants.js");
        httpsResponse.EnsureSuccessStatusCode();

        var hstsValue = string.Join("", httpsResponse.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Is.EqualTo("max-age=3600"));
    }

    [Test]
    public async Task Should_include_subdomains_in_hsts()
    {
        using var factory = TestConfiguration.CreateWithAllHttpsEnabled(includeSubDomains: true);
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });

        var response = await client.GetAsync("/js/app.constants.js");
        response.EnsureSuccessStatusCode();

        var hstsValue = string.Join("", response.Headers.GetValues("Strict-Transport-Security"));
        Assert.That(hstsValue, Does.Contain("includeSubDomains"));
    }
}
