namespace ServicePulse.Tests.Infrastructure;

using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

public class ServicePulseWebApplicationFactory : WebApplicationFactory<Program>
{
    readonly Dictionary<string, string?> environmentVariables = new();
    readonly Dictionary<string, string?> originalValues = new();
    string environment = "Development";
    string simulatedRemoteIp = "127.0.0.1";
    bool clearHstsExcludedHosts;

    /// <summary>
    /// Sets an environment variable for this test. The value will be restored after the test.
    /// </summary>
    public ServicePulseWebApplicationFactory WithEnvironmentVariable(string name, string? value)
    {
        environmentVariables[name] = value;
        return this;
    }

    /// <summary>
    /// Sets the ASP.NET Core environment (Development, Production, etc.)
    /// </summary>
    public ServicePulseWebApplicationFactory WithEnvironment(string env)
    {
        environment = env;
        return this;
    }

    /// <summary>
    /// Sets the simulated remote IP address for incoming requests.
    /// </summary>
    public ServicePulseWebApplicationFactory WithRemoteIpAddress(string ipAddress)
    {
        simulatedRemoteIp = ipAddress;
        return this;
    }

    /// <summary>
    /// Clears the HSTS excluded hosts list so HSTS headers are added for localhost.
    /// By default, ASP.NET Core excludes localhost, 127.0.0.1, and [::1] from HSTS.
    /// </summary>
    public ServicePulseWebApplicationFactory WithHstsExcludedHostsCleared()
    {
        clearHstsExcludedHosts = true;
        return this;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Store original values and set new values
        foreach (var kvp in environmentVariables)
        {
            originalValues[kvp.Key] = Environment.GetEnvironmentVariable(kvp.Key);
            Environment.SetEnvironmentVariable(kvp.Key, kvp.Value);
        }

        builder.UseEnvironment(environment);

        builder.ConfigureServices(services =>
        {
            // Register the simulated IP address options
            services.AddSingleton(new FakeRemoteIpAddressOptions { IpAddress = IPAddress.Parse(simulatedRemoteIp) });

            // Insert the startup filter at the beginning to ensure our middleware runs first
            services.Insert(0, ServiceDescriptor.Transient<IStartupFilter, FakeRemoteIpAddressStartupFilter>());

            // Clear HSTS excluded hosts if requested (for testing HSTS with localhost)
            if (clearHstsExcludedHosts)
            {
                services.Configure<Microsoft.AspNetCore.HttpsPolicy.HstsOptions>(options =>
                {
                    options.ExcludedHosts.Clear();
                });
            }
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            // Restore original environment variables
            foreach (var kvp in originalValues)
            {
                Environment.SetEnvironmentVariable(kvp.Key, kvp.Value);
            }
        }

        base.Dispose(disposing);
    }
}

public class FakeRemoteIpAddressOptions
{
    public IPAddress IpAddress { get; set; } = IPAddress.Loopback;
}

public class FakeRemoteIpAddressStartupFilter : IStartupFilter
{
    readonly FakeRemoteIpAddressOptions options;

    public FakeRemoteIpAddressStartupFilter(FakeRemoteIpAddressOptions options)
    {
        this.options = options;
    }

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.UseMiddleware<FakeRemoteIpAddressMiddleware>(options);
            next(app);
        };
    }
}
