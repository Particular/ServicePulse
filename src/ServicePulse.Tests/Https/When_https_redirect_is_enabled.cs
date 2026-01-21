namespace ServicePulse.Tests.Https;

using System.Net;
using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests HTTP to HTTPS redirect behavior.
/// </summary>
[TestFixture]
public class When_https_redirect_is_enabled : HttpsTestBase
{
    [SetUp]
    public void SetUp()
    {
        Factory = TestConfiguration.CreateWithHttpsRedirectEnabled();
        Client = CreateHttpClient(allowAutoRedirect: false);
    }

    [Test]
    public async Task Should_redirect_http_to_https()
    {
        var response = await Client.GetAsync("/some/path");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.StartWith("https://"));
    }

    [Test]
    public async Task Should_not_redirect_https_request()
    {
        using var httpsClient = CreateHttpsClient(allowAutoRedirect: false);

        var response = await httpsClient.GetAsync("/js/app.constants.js");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    }

    [Test]
    public async Task Should_include_custom_port_in_redirect()
    {
        Factory.Dispose();
        Client.Dispose();

        Factory = TestConfiguration.CreateWithHttpsRedirectEnabled(httpsPort: 8443);
        Client = CreateHttpClient(allowAutoRedirect: false);

        var response = await Client.GetAsync("/test");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain(":8443"));
    }

    [Test]
    public async Task Should_omit_port_443_in_redirect()
    {
        // Port 443 is the default HTTPS port and should be omitted
        var response = await Client.GetAsync("/test");

        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
        Assert.That(response.Headers.Location?.ToString(), Does.Not.Contain(":443"));
    }

    [Test]
    public async Task Should_preserve_path_in_redirect()
    {
        var response = await Client.GetAsync("/some/path");

        Assert.That(response.Headers.Location?.ToString(), Does.Contain("/some/path"));
    }

    [Test]
    public async Task Should_preserve_query_string()
    {
        var response = await Client.GetAsync("/test?foo=bar&baz=qux");

        Assert.That(response.Headers.Location?.ToString(), Does.Contain("foo=bar"));
        Assert.That(response.Headers.Location?.ToString(), Does.Contain("baz=qux"));
    }

    [Test]
    public async Task Should_use_307_to_preserve_http_method()
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/data");
        var response = await Client.SendAsync(request);

        // 307 preserves the HTTP method (important for POST, PUT, etc.)
        Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.TemporaryRedirect));
    }
}
