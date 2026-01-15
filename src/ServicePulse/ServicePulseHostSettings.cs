namespace ServicePulse;

class ServicePulseHostSettings
{
    public required bool EnableReverseProxy { get; init; }

    public static ServicePulseHostSettings GetFromEnvironmentVariables()
    {
        var enableReverseProxyValue = Environment.GetEnvironmentVariable("ENABLE_REVERSE_PROXY");

        if (!bool.TryParse(enableReverseProxyValue, out var enableReverseProxy))
        {
            enableReverseProxy = true;
        }

        return new ServicePulseHostSettings
        {
            EnableReverseProxy = enableReverseProxy
        };
    }
}