namespace ServicePulse.Host.Tests.AcceptanceTests.ForwardedHeaders
{
    using System.Text.Json.Serialization;

    /// <summary>
    /// Represents the JSON response from the /debug/request-info endpoint.
    /// </summary>
    public class DebugRequestInfoResponse
    {
        [JsonPropertyName("processed")]
        public ProcessedValues Processed { get; set; }

        [JsonPropertyName("rawHeaders")]
        public RawHeaders RawHeaders { get; set; }

        [JsonPropertyName("configuration")]
        public ConfigurationValues Configuration { get; set; }
    }

    public class ProcessedValues
    {
        [JsonPropertyName("scheme")]
        public string Scheme { get; set; }

        [JsonPropertyName("host")]
        public string Host { get; set; }

        [JsonPropertyName("remoteIpAddress")]
        public string RemoteIpAddress { get; set; }
    }

    public class RawHeaders
    {
        [JsonPropertyName("xForwardedFor")]
        public string XForwardedFor { get; set; }

        [JsonPropertyName("xForwardedProto")]
        public string XForwardedProto { get; set; }

        [JsonPropertyName("xForwardedHost")]
        public string XForwardedHost { get; set; }
    }

    public class ConfigurationValues
    {
        [JsonPropertyName("enabled")]
        public bool Enabled { get; set; }

        [JsonPropertyName("trustAllProxies")]
        public bool TrustAllProxies { get; set; }

        [JsonPropertyName("knownProxies")]
        public string[] KnownProxies { get; set; }

        [JsonPropertyName("knownNetworks")]
        public string[] KnownNetworks { get; set; }
    }
}
