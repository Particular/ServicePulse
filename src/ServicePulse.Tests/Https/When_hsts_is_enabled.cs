namespace ServicePulse.Tests.Https;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HSTS (HTTP Strict Transport Security) header behavior.
/// HSTS requires Production environment (disabled in Development by ASP.NET Core).
/// </summary>
[TestFixture]
public class When_hsts_is_enabled : HttpsTestBase
{
    [Test]
    public async Task Should_add_hsts_header_for_https_request()
    {
        Factory = TestConfiguration.CreateWithHstsEnabled();
        Client = CreateHttpsClient();

        var response = await Client.GetAsync("/js/app.constants.js");

        var hstsValue = GetHstsHeaderValue(response);
        Assert.That(hstsValue, Is.Not.Null);
        Assert.That(hstsValue, Does.Contain("max-age=31536000"));
    }

    [Test]
    public async Task Should_not_add_hsts_header_for_http_request()
    {
        Factory = TestConfiguration.CreateWithHstsEnabled();
        Client = CreateHttpClient();

        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(GetHstsHeaderValue(response), Is.Null);
    }

    [Test]
    public async Task Should_use_custom_max_age()
    {
        Factory = TestConfiguration.CreateWithHstsEnabled(maxAgeSeconds: 86400);
        Client = CreateHttpsClient();

        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(GetHstsHeaderValue(response), Is.EqualTo("max-age=86400"));
    }

    [Test]
    public async Task Should_include_subdomains_when_configured()
    {
        Factory = TestConfiguration.CreateWithHstsEnabled(includeSubDomains: true);
        Client = CreateHttpsClient();

        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(GetHstsHeaderValue(response), Does.Contain("includeSubDomains"));
    }

    [Test]
    public async Task Should_not_include_subdomains_by_default()
    {
        Factory = TestConfiguration.CreateWithHstsEnabled(includeSubDomains: false);
        Client = CreateHttpsClient();

        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(GetHstsHeaderValue(response), Does.Not.Contain("includeSubDomains"));
    }
}
