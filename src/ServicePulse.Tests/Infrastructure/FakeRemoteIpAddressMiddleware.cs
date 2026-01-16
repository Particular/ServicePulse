namespace ServicePulse.Tests.Infrastructure;

/// <summary>
/// Middleware that injects a simulated remote IP address for testing.
/// WebApplicationFactory/TestServer doesn't set RemoteIpAddress by default.
/// </summary>
public class FakeRemoteIpAddressMiddleware
{
    readonly RequestDelegate next;
    readonly FakeRemoteIpAddressOptions options;

    public FakeRemoteIpAddressMiddleware(RequestDelegate next, FakeRemoteIpAddressOptions options)
    {
        this.next = next;
        this.options = options;
    }

    public Task InvokeAsync(HttpContext context)
    {
        // Set the RemoteIpAddress - ASP.NET Core allows setting this directly
        context.Connection.RemoteIpAddress = options.IpAddress;
        return next(context);
    }
}
