# ServicePulse Hosting Guide

This guide covers hosting and configuration for ServicePulse in production environments. ServicePulse is available as two separate host implementations:

| Host                                   | Target Framework   | Use Case                                       |
|----------------------------------------|--------------------|------------------------------------------------|
| **ServicePulse** (.NET 8)              | .NET 8.0           | Modern deployments, containers, cross-platform |
| **ServicePulse.Host** (.NET Framework) | .NET Framework 4.8 | Legacy Windows deployments, Windows Service    |

> **Note:** Authentication for ServicePulse is configured in ServiceControl, not in ServicePulse itself. When authentication is enabled on ServiceControl, ServicePulse automatically retrieves the OIDC configuration from the ServiceControl API and handles the OAuth flow. See the [ServiceControl hosting guide](https://github.com/Particular/ServiceControl/blob/master/docs/hosting-guide.md) for authentication configuration details.

---

## ServicePulse (.NET 8)

The .NET 8 host is a modern ASP.NET Core application suitable for containers and cross-platform deployments.

### Configuration

All settings are configured via environment variables:

| Environment Variable   | Default                       | Description                                        |
|------------------------|-------------------------------|----------------------------------------------------|
| `SERVICECONTROL_URL`   | `http://localhost:33333/api/` | ServiceControl Primary API URL                     |
| `MONITORING_URL`       | `http://localhost:33633/`     | ServiceControl Monitoring URL (use `!` to disable) |
| `DEFAULT_ROUTE`        | `/dashboard`                  | Default route after login                          |
| `SHOW_PENDING_RETRY`   | `false`                       | Show pending retry messages                        |
| `ENABLE_REVERSE_PROXY` | `true`                        | Enable built-in reverse proxy to ServiceControl    |

### Reverse Proxy Mode

When `ENABLE_REVERSE_PROXY=true` (default), ServicePulse proxies API requests to ServiceControl:

- `/api/*` → ServiceControl Primary
- `/monitoring-api/*` → ServiceControl Monitoring

This simplifies deployment by exposing a single endpoint for both the SPA and API requests.

When disabled, the frontend connects directly to ServiceControl URLs (requires CORS configuration on ServiceControl).

### HTTPS Settings

| Environment Variable                       | Default    | Description                                            |
|--------------------------------------------|------------|--------------------------------------------------------|
| `SERVICEPULSE_HTTPS_ENABLED`               | `false`    | Enable Kestrel HTTPS with certificate                  |
| `SERVICEPULSE_HTTPS_CERTIFICATEPATH`       | -          | Path to PFX certificate file                           |
| `SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD`   | -          | Certificate password                                   |
| `SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS`   | `false`    | Redirect HTTP requests to HTTPS                        |
| `SERVICEPULSE_HTTPS_PORT`                  | -          | HTTPS port for redirects (required with reverse proxy) |
| `SERVICEPULSE_HTTPS_ENABLEHSTS`            | `false`    | Enable HTTP Strict Transport Security                  |
| `SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS`     | `31536000` | HSTS max-age in seconds (1 year)                       |
| `SERVICEPULSE_HTTPS_HSTSINCLUDESUBDOMAINS` | `false`    | Include subdomains in HSTS                             |

### Forwarded Headers Settings

| Environment Variable                            | Default | Description                                   |
|-------------------------------------------------|---------|-----------------------------------------------|
| `SERVICEPULSE_FORWARDEDHEADERS_ENABLED`         | `true`  | Enable forwarded headers processing           |
| `SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES` | `true`  | Trust X-Forwarded-* from any source           |
| `SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES`    | -       | Comma-separated list of trusted proxy IPs     |
| `SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS`   | -       | Comma-separated list of trusted CIDR networks |

> **Note:** If `KNOWNPROXIES` or `KNOWNNETWORKS` are configured, `TRUSTALLPROXIES` is automatically set to `false`.

### Running the .NET 8 Host

```cmd
rem Basic usage
dotnet ServicePulse.dll

rem With custom ServiceControl URL
set SERVICECONTROL_URL=https://servicecontrol:33333/api/
dotnet ServicePulse.dll

rem With monitoring disabled
set MONITORING_URL=!
dotnet ServicePulse.dll
```

---

## ServicePulse.Host (.NET Framework 4.8)

The .NET Framework host is a self-hosted OWIN application that can run as a Windows Service or console application.

### Command Line Options

```text
ServicePulse.Host.exe [options]
```

#### Run Options

| Option                               | Default                 | Description                                                     |
|--------------------------------------|-------------------------|-----------------------------------------------------------------|
| `--url=`                             | `http://localhost:8081` | URL to listen on                                                |
| `--forwardedheadersenabled=`         | `true`                  | Enable processing of forwarded headers                          |
| `--forwardedheaderstrustallproxies=` | `true`                  | Trust all proxies for forwarded headers                         |
| `--forwardedheadersknownproxies=`    | -                       | Comma-separated list of trusted proxy IP addresses              |
| `--forwardedheadersknownnetworks=`   | -                       | Comma-separated list of trusted proxy networks in CIDR notation |
| `--httpsenabled=`                    | `false`                 | Enable HTTPS features (certificate bound via netsh)             |
| `--httpsredirecthttptohttps=`        | `false`                 | Redirect HTTP requests to HTTPS                                 |
| `--httpsport=`                       | -                       | HTTPS port for redirect (required for reverse proxy scenarios)  |
| `--httpsenablehsts=`                 | `false`                 | Enable HTTP Strict Transport Security                           |
| `--httpshstsmaxageseconds=`          | `31536000`              | HSTS max age in seconds (1 year)                                |
| `--httpshstsincludesubdomains=`      | `false`                 | Include subdomains in HSTS policy                               |

#### Install Options

| Option                           | Default                   | Description                    |
|----------------------------------|---------------------------|--------------------------------|
| `--install`                      | -                         | Install as Windows Service     |
| `--servicename=`                 | `Particular.ServicePulse` | Service name                   |
| `--displayname=`                 | `Particular ServicePulse` | Service display name           |
| `--description=`                 | -                         | Service description            |
| `--username=`                    | -                         | Service account username       |
| `--password=`                    | -                         | Service account password       |
| `--localservice`                 | (default)                 | Run as Local Service account   |
| `--networkservice`               | -                         | Run as Network Service account |
| `--user`                         | -                         | Run as specified user account  |
| `--autostart`                    | (default)                 | Start automatically            |
| `--delayed`                      | -                         | Start automatically (delayed)  |
| `--manual`                       | -                         | Start manually                 |
| `--disabled`                     | -                         | Service disabled               |
| `--servicecontrolurl=`           | -                         | ServiceControl Primary API URL |
| `--servicecontrolmonitoringurl=` | -                         | ServiceControl Monitoring URL  |
| `--url=`                         | `http://localhost:8081`   | URL to listen on               |

#### Uninstall Options

| Option           | Description               |
|------------------|---------------------------|
| `--uninstall`    | Uninstall Windows Service |
| `--servicename=` | Service name to uninstall |

#### Extract Options

| Option                           | Description                             |
|----------------------------------|-----------------------------------------|
| `--extract`                      | Extract files for web server deployment |
| `--outpath=`                     | Output path for extracted files         |
| `--servicecontrolurl=`           | ServiceControl Primary API URL          |
| `--servicecontrolmonitoringurl=` | ServiceControl Monitoring URL           |

### Examples

**Install as Windows Service:**

```cmd
ServicePulse.Host.exe --install ^
  --servicename="Particular.ServicePulse" ^
  --displayname="Particular ServicePulse" ^
  --url="http://localhost:9090" ^
  --servicecontrolurl="http://localhost:33333/api" ^
  --servicecontrolmonitoringurl="http://localhost:33633"
```

**Install with custom service account:**

```cmd
ServicePulse.Host.exe --install ^
  --servicename="Particular.ServicePulse" ^
  --username="DOMAIN\serviceuser" ^
  --password="p@ssw0rd!" ^
  --url="http://localhost:9090"
```

**Uninstall service:**

```cmd
ServicePulse.Host.exe --uninstall --servicename="Particular.ServicePulse"
```

**Run in console mode:**

```cmd
ServicePulse.Host.exe --url="http://localhost:9090"
```

**Extract for IIS deployment:**

```cmd
ServicePulse.Host.exe --extract ^
  --outpath="C:\inetpub\wwwroot\ServicePulse" ^
  --servicecontrolurl="http://localhost:33333/api" ^
  --servicecontrolmonitoringurl="http://localhost:33633"
```

### URL ACL Reservation

The .NET Framework host uses HTTP.sys, which requires URL ACL reservation for non-administrator users:

```cmd
netsh http add urlacl url=http://+:8081/ user="NT AUTHORITY\LOCAL SERVICE"
```

For HTTPS, you must also bind an SSL certificate:

```cmd
netsh http add sslcert ipport=0.0.0.0:443 certhash=<thumbprint> appid={<guid>}
```

---

## Production Deployment Scenarios

### Scenario 1: Reverse Proxy with ServicePulse (.NET 8)

ServicePulse sits behind a reverse proxy (NGINX, IIS ARR, cloud load balancer) that handles SSL/TLS termination.

**Architecture:**

```text
Browser → HTTPS → Reverse Proxy → HTTP → ServicePulse → HTTP → ServiceControl
                  (SSL termination)      (reverse proxy)
```

**Configuration:**

```cmd
rem ServicePulse environment variables
set SERVICECONTROL_URL=http://servicecontrol:33333/api/
set MONITORING_URL=http://monitoring:33633/
set ENABLE_REVERSE_PROXY=true

rem Forwarded headers - trust only your reverse proxy
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=false
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=10.0.0.5

rem Optional HTTPS redirect (if proxy allows HTTP through)
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=true
set SERVICEPULSE_HTTPS_PORT=443
```

### Scenario 2: Direct HTTPS with ServicePulse (.NET 8)

Kestrel handles TLS directly without a reverse proxy.

**Architecture:**

```text
Browser → HTTPS → ServicePulse (Kestrel) → HTTP → ServiceControl
                  (TLS + SPA serving)
```

**Configuration:**

```cmd
rem ServicePulse environment variables
set SERVICECONTROL_URL=https://servicecontrol:33333/api/
set MONITORING_URL=https://servicecontrol-monitor:33633/
set ENABLE_REVERSE_PROXY=true

rem Kestrel HTTPS
set SERVICEPULSE_HTTPS_ENABLED=true
set SERVICEPULSE_HTTPS_CERTIFICATEPATH=C:\certs\servicepulse.pfx
set SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=your-password
set SERVICEPULSE_HTTPS_ENABLEHSTS=true
set SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS=31536000

rem No forwarded headers (no proxy)
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=false
```

### Scenario 3: Windows Service with Reverse Proxy (.NET Framework)

ServicePulse.Host runs as a Windows Service behind IIS ARR or another reverse proxy.

**Architecture:**

```text
Browser → HTTPS → IIS ARR → HTTP → ServicePulse.Host
                  (SSL termination)
```

**Installation:**

```cmd
ServicePulse.Host.exe --install ^
  --servicename="Particular.ServicePulse" ^
  --url="http://localhost:8081" ^
  --servicecontrolurl="http://localhost:33333/api" ^
  --forwardedheadersenabled=true ^
  --forwardedheaderstrustallproxies=false ^
  --forwardedheadersknownproxies=127.0.0.1 ^
  --httpsredirecthttptohttps=true ^
  --httpsport=443
```

### Scenario 4: Direct HTTPS Windows Service (.NET Framework)

ServicePulse.Host uses HTTP.sys with an SSL certificate bound at the OS level.

**Architecture:**

```text
Browser → HTTPS → ServicePulse.Host (HTTP.sys)
                  (SSL via netsh binding)
```

**Setup:**

1. Bind SSL certificate:

```cmd
netsh http add sslcert ipport=0.0.0.0:443 certhash=<thumbprint> appid={12345678-1234-1234-1234-123456789012}
```

2. Reserve URL:

```cmd
netsh http add urlacl url=https://+:443/ user="NT AUTHORITY\LOCAL SERVICE"
```

3. Install service:

```cmd
ServicePulse.Host.exe --install ^
  --servicename="Particular.ServicePulse" ^
  --url="https://servicepulse:443" ^
  --servicecontrolurl="http://localhost:33333/api" ^
  --httpsenabled=true ^
  --httpsenablehsts=true ^
  --forwardedheadersenabled=false
```

---

## Configuration Reference

### ServicePulse (.NET 8) - Environment Variables

| Setting                                         | Default                       | Description                                    |
|-------------------------------------------------|-------------------------------|------------------------------------------------|
| `SERVICECONTROL_URL`                            | `http://localhost:33333/api/` | ServiceControl Primary API URL                 |
| `MONITORING_URL`                                | `http://localhost:33633/`     | ServiceControl Monitoring URL (`!` to disable) |
| `DEFAULT_ROUTE`                                 | `/dashboard`                  | Default route after login                      |
| `SHOW_PENDING_RETRY`                            | `false`                       | Show pending retry messages                    |
| `ENABLE_REVERSE_PROXY`                          | `true`                        | Enable built-in reverse proxy                  |
| `SERVICEPULSE_HTTPS_ENABLED`                    | `false`                       | Enable Kestrel HTTPS                           |
| `SERVICEPULSE_HTTPS_CERTIFICATEPATH`            | -                             | Path to PFX certificate                        |
| `SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD`        | -                             | Certificate password                           |
| `SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS`        | `false`                       | Redirect HTTP to HTTPS                         |
| `SERVICEPULSE_HTTPS_PORT`                       | -                             | HTTPS port for redirects                       |
| `SERVICEPULSE_HTTPS_ENABLEHSTS`                 | `false`                       | Enable HSTS                                    |
| `SERVICEPULSE_HTTPS_HSTSMAXAGESECONDS`          | `31536000`                    | HSTS max-age (1 year)                          |
| `SERVICEPULSE_HTTPS_HSTSINCLUDESUBDOMAINS`      | `false`                       | HSTS include subdomains                        |
| `SERVICEPULSE_FORWARDEDHEADERS_ENABLED`         | `true`                        | Enable forwarded headers                       |
| `SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES` | `true`                        | Trust all proxies                              |
| `SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES`    | -                             | Trusted proxy IPs (comma-separated)            |
| `SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS`   | -                             | Trusted networks in CIDR notation              |

### ServicePulse.Host (.NET Framework) - Command Line

| Option                               | Default                 | Description                         |
|--------------------------------------|-------------------------|-------------------------------------|
| `--url=`                             | `http://localhost:8081` | Listen URL                          |
| `--servicecontrolurl=`               | -                       | ServiceControl Primary API URL      |
| `--servicecontrolmonitoringurl=`     | -                       | ServiceControl Monitoring URL       |
| `--forwardedheadersenabled=`         | `true`                  | Enable forwarded headers            |
| `--forwardedheaderstrustallproxies=` | `true`                  | Trust all proxies                   |
| `--forwardedheadersknownproxies=`    | -                       | Trusted proxy IPs (comma-separated) |
| `--forwardedheadersknownnetworks=`   | -                       | Trusted networks in CIDR notation   |
| `--httpsenabled=`                    | `false`                 | Enable HTTPS features               |
| `--httpsredirecthttptohttps=`        | `false`                 | Redirect HTTP to HTTPS              |
| `--httpsport=`                       | -                       | HTTPS port for redirects            |
| `--httpsenablehsts=`                 | `false`                 | Enable HSTS                         |
| `--httpshstsmaxageseconds=`          | `31536000`              | HSTS max-age (1 year)               |
| `--httpshstsincludesubdomains=`      | `false`                 | HSTS include subdomains             |

---

## Scenario Comparison Matrix

| Feature                    | .NET 8 + Reverse Proxy | .NET 8 Direct HTTPS | .NET Framework + Reverse Proxy | .NET Framework Direct HTTPS |
|----------------------------|:----------------------:|:-------------------:|:------------------------------:|:---------------------------:|
| **Built-in Reverse Proxy** |           ✅            |          ✅          |               ❌                |              ❌              |
| **Kestrel HTTPS**          |      ❌ (at proxy)      |          ✅          |              N/A               |             N/A             |
| **HTTP.sys HTTPS**         |          N/A           |         N/A         |          ❌ (at proxy)          |        ✅ (via netsh)        |
| **HTTPS Redirection**      |      ✅ (optional)      |         N/A         |          ✅ (optional)          |             N/A             |
| **HSTS**                   |      ❌ (at proxy)      |          ✅          |          ❌ (at proxy)          |              ✅              |
| **Forwarded Headers**      |           ✅            |          ❌          |               ✅                |              ❌              |
| **Windows Service**        |           ❌            |          ❌          |               ✅                |              ✅              |
| **Cross-Platform**         |           ✅            |          ✅          |               ❌                |              ❌              |
| **Container Support**      |           ✅            |          ✅          |               ❌                |              ❌              |

---

## Security Considerations

### Forwarded Headers

> **⚠️ Security Warning:** Never set `TRUSTALLPROXIES` to `true` in production when ServicePulse is accessible from untrusted networks. This can allow attackers to spoof client IP addresses and bypass security controls.

When behind a reverse proxy, always configure specific trusted proxies:

```cmd
rem .NET 8
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=false
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=10.0.0.5

rem .NET Framework
ServicePulse.Host.exe --forwardedheaderstrustallproxies=false --forwardedheadersknownproxies=10.0.0.5
```

### Certificate Management

For .NET 8 with Kestrel HTTPS:
- Use certificates from a trusted CA for production
- Minimum key size: 2048-bit RSA or 256-bit ECC
- Never commit certificates to source control
- Restrict file permissions to the service account

For .NET Framework with HTTP.sys:
- Bind certificates using `netsh http add sslcert`
- Certificate must be in the Local Machine certificate store
- Private key must be accessible to the service account

---

## See Also

- [Authentication Testing](authentication-testing.md) - Testing authentication scenarios
- [Forwarded Headers Testing](forwarded-headers-testing.md) - Testing forwarded headers
- [HTTPS Configuration](https-configuration.md) - Detailed HTTPS setup (if available)
