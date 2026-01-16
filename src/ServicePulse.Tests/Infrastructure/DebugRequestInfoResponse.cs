namespace ServicePulse.Tests.Infrastructure;

using System.Text.Json.Serialization;

/// <summary>
/// Represents the JSON response from the /debug/request-info endpoint.
/// </summary>
public class DebugRequestInfoResponse
{
    [JsonPropertyName("processed")]
    public ProcessedValues Processed { get; set; } = new();

    [JsonPropertyName("rawHeaders")]
    public RawHeaders RawHeaders { get; set; } = new();

    [JsonPropertyName("configuration")]
    public ConfigurationValues Configuration { get; set; } = new();
}

public class ProcessedValues
{
    [JsonPropertyName("scheme")]
    public string Scheme { get; set; } = string.Empty;

    [JsonPropertyName("host")]
    public string Host { get; set; } = string.Empty;

    [JsonPropertyName("remoteIpAddress")]
    public string? RemoteIpAddress { get; set; }
}

public class RawHeaders
{
    [JsonPropertyName("xForwardedFor")]
    public string XForwardedFor { get; set; } = string.Empty;

    [JsonPropertyName("xForwardedProto")]
    public string XForwardedProto { get; set; } = string.Empty;

    [JsonPropertyName("xForwardedHost")]
    public string XForwardedHost { get; set; } = string.Empty;
}

public class ConfigurationValues
{
    [JsonPropertyName("enabled")]
    public bool Enabled { get; set; }

    [JsonPropertyName("trustAllProxies")]
    public bool TrustAllProxies { get; set; }

    [JsonPropertyName("knownProxies")]
    public string[] KnownProxies { get; set; } = [];

    [JsonPropertyName("knownNetworks")]
    public string[] KnownNetworks { get; set; } = [];
}
