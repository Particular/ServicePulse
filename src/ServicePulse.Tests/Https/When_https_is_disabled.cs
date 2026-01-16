namespace ServicePulse.Tests.Https;

using System.Net;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests behavior when all HTTPS features are disabled.
/// </summary>
[TestFixture]
public class When_https_is_disabled
{
    ServicePulseWebApplicationFactory factory = null!;
    HttpClient client = null!;

    [SetUp]
    public void SetUp()
    {
        factory = TestConfiguration.CreateWithHttpsDisabled();
        client = factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        client.Dispose();
        factory.Dispose();
    }

    [Test]
    public async Task Should_not_add_hsts_header()
    {
        var response = await client.GetAsync("/");

        Assert.That(response.Headers.Contains("Strict-Transport-Security"), Is.False);
    }

    [Test]
    public async Task Should_not_redirect_http_request()
    {
        var response = await client.GetAsync("/");

        // Should not redirect - either OK or NotFound (if no route matches)
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.PermanentRedirect));
        Assert.That(response.StatusCode, Is.Not.EqualTo(HttpStatusCode.MovedPermanently));
    }

    [Test]
    public async Task Should_pass_through_to_next_middleware()
    {
        // Request should reach the application (static files or endpoints)
        var response = await client.GetAsync("/js/app.constants.js");

        // The app.constants.js endpoint should be reachable
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }
}
