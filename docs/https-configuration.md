# HTTPS Configuration

ServicePulse can be configured to use HTTPS directly, enabling encrypted connections without relying on a reverse proxy for SSL termination.

## ServicePulse (.NET 8)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVICEPULSE_HTTPS_ENABLED` | `false` | Enable HTTPS with Kestrel |
| `SERVICEPULSE_HTTPS_CERTIFICATEPATH` | (none) | Path to the certificate file (.pfx) |
| `SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD` | (none) | Password for the certificate file |
| `SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS` | `false` | Redirect HTTP requests to HTTPS |
| `SERVICEPULSE_HTTPS_PORT` | (none) | HTTPS port for redirect (required for reverse proxy scenarios) |
| `SERVICEPULSE_HTTPS_ENABLEHSTS` | `false` | Enable HTTP Strict Transport Security |
| `SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS` | `31536000` | HSTS max-age in seconds (default: 1 year) |
| `SERVICEPULSE_HTTPS_HSTSINCLUDESUBDOMAINS` | `false` | Include subdomains in HSTS policy |

### Docker Example

```bash
docker run -p 9090:9090 \
  -e SERVICEPULSE_HTTPS_ENABLED=true \
  -e SERVICEPULSE_HTTPS_CERTIFICATEPATH=/certs/servicepulse.pfx \
  -e SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=mycertpassword \
  -e SERVICEPULSE_HTTPS_ENABLEHSTS=true \
  -v /path/to/certs:/certs:ro \
  particular/servicepulse:latest
```

## ServicePulse.Host (.NET Framework)

ServicePulse.Host uses Windows HttpListener which requires SSL certificate binding at the OS level using `netsh`. The certificate is not configured in the application itself.

### Command-Line Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--httpsenabled=` | `false` | Enable HTTPS features (HSTS, redirects) |
| `--httpsredirecthttptohttps=` | `false` | Redirect HTTP requests to HTTPS |
| `--httpsport=` | (none) | HTTPS port for redirect (required for reverse proxy scenarios) |
| `--httpsenablehsts=` | `false` | Enable HTTP Strict Transport Security |
| `--httpshstsmaxageseconds=` | `31536000` | HSTS max-age in seconds (default: 1 year) |
| `--httpshstsincludesubdomains=` | `false` | Include subdomains in HSTS policy |

### Example

```cmd
ServicePulse.Host.exe --url=https://localhost:9090 --httpsenabled=true --httpsenablehsts=true
```

### SSL Certificate Binding

ServicePulse.Host requires the SSL certificate to be bound at the OS level using `netsh` before starting the application. See [Local HTTPS Testing](local-https-testing.md) for detailed setup instructions.

## Security Considerations

### Certificate Security

- Store certificate files securely with appropriate file permissions
- Use strong passwords for certificate files
- Rotate certificates before expiration
- Use certificates from a trusted Certificate Authority for production

### HSTS Considerations

- HSTS should not be tested on localhost because browsers cache the policy, which could break other local development
- HSTS is disabled in Development environment on .NET 8 (ASP.NET Core excludes localhost by default)
- HSTS can be configured at either the reverse proxy level or in ServicePulse (but not both)
- HSTS is cached by browsers, so test carefully before enabling in production
- Start with a short max-age during initial deployment
- Consider the impact on subdomains before enabling `includeSubDomains`
- To test HSTS locally, use the [NGINX reverse proxy setup](local-nginx-testing.md) with a custom hostname

### HTTP to HTTPS Redirect

The `SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS` setting is intended for use with a reverse proxy that handles both HTTP and HTTPS traffic. When enabled:

- The redirect uses HTTP 307 (Temporary Redirect) to preserve the request method
- The reverse proxy must forward both HTTP and HTTPS requests to ServicePulse
- ServicePulse will redirect HTTP requests to HTTPS based on the `X-Forwarded-Proto` header
- **Important:** You must also set `SERVICEPULSE_HTTPS_PORT` (or `--httpsport=` for .NET Framework) to specify the HTTPS port for the redirect URL

> **Note:** When running ServicePulse directly without a reverse proxy, the application only listens on a single protocol (HTTP or HTTPS). To test HTTP-to-HTTPS redirection locally, use the [NGINX reverse proxy setup](local-nginx-testing.md).

## See Also

- [Local HTTPS Testing](local-https-testing.md) - Guide for testing HTTPS locally during development
- [Local Reverse Proxy Testing](local-nginx-testing.md) - Testing with NGINX reverse proxy (HSTS, HTTP to HTTPS redirect)
- [Forwarded Headers Configuration](forwarded-headers.md) - Configure forwarded headers when behind a reverse proxy
