namespace ServicePulse.Tests.Https;

using System.Net;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when all HTTPS features are disabled.
/// </summary>
[TestFixture]
public class When_https_is_disabled : HttpsTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithHttpsDisabled();
        Client = CreateHttpClient();
    }

    [Test]
    public async Task Should_not_add_hsts_header()
    {
        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
    }

    [Test]
    public async Task Should_not_redirect_http_request()
    {
        var response = await Client.GetAsync("/js/app.constants.js");

        // Should not redirect
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.PermanentRedirect));
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.MovedPermanently));
    }

    [Test]
    public async Task Should_serve_content_normally()
    {
        var response = await Client.GetAsync("/js/app.constants.js");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }
}
