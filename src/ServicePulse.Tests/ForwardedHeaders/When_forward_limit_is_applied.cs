namespace ServicePulse.Tests.ForwardedHeaders;

using ServicePulse.Tests.Infrastructure;

/// <summary>
/// Tests ForwardLimit behavior which controls how many proxy hops are processed.
/// When TrustAllProxies=true, ForwardLimit is ignored (all entries processed).
/// When TrustAllProxies=false, ForwardLimit defaults to 1 (only rightmost entry processed).
/// </summary>
[TestFixture]
public class When_forward_limit_is_applied : ForwardedHeadersTestBase
{
    [Test]
    public async Task Trust_all_proxies_should_process_entire_chain()
    {
        // TrustAllProxies=true means ForwardLimit=null (no limit)
        Factory = TestConfiguration.CreateWithForwardedHeadersDefaults();
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1",
            forwardedProto: "https");

        // Should process all entries and return the leftmost (original client)
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));

        // All entries should be consumed
        Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
    }

    [Test]
    public async Task Known_proxies_should_apply_forward_limit_of_one()
    {
        // TrustAllProxies=false means ForwardLimit=1
        Factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, 10.0.0.1, 192.168.1.1",
            forwardedProto: "https");

        // With ForwardLimit=1, should only process the rightmost entry
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("192.168.1.1"));

        // Remaining entries should stay in the header
        Assert.That(result.RawHeaders.XForwardedFor, Is.EqualTo("203.0.113.50,10.0.0.1"));
    }

    [Test]
    public async Task Single_entry_should_be_processed_regardless_of_limit()
    {
        Factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50",
            forwardedProto: "https");

        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("203.0.113.50"));
        Assert.That(result.RawHeaders.XForwardedFor, Is.Empty);
    }

    [Test]
    public async Task Proto_and_host_should_use_rightmost_value()
    {
        // Proto and host always use the rightmost (most recent proxy) value
        Factory = TestConfiguration.CreateWithKnownProxies("127.0.0.1");
        Client = Factory.CreateClient();

        var result = await SendRequestWithHeaders(
            forwardedFor: "203.0.113.50, 10.0.0.1",
            forwardedProto: "https, http",
            forwardedHost: "public.example.com, internal.example.com");

        // Proto and host use rightmost value (most recent proxy)
        Assert.That(result.Processed.Scheme, Is.EqualTo("http"));
        Assert.That(result.Processed.Host, Is.EqualTo("internal.example.com"));

        // ForwardedFor also uses rightmost with ForwardLimit=1
        Assert.That(result.Processed.RemoteIpAddress, Is.EqualTo("10.0.0.1"));
    }
}
