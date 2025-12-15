# ServicePulse Hosting Options

There are several ways to host ServicePulse:

## 1. Docker Container (Modern - Recommended)

Uses the **ServicePulse** project (.NET 8.0 + ASP.NET Core)

```bash
docker run -p 9090:9090 \
  -e SERVICECONTROL_URL="http://servicecontrol:33333/api/" \
  -e MONITORING_URL="http://servicecontrol-monitoring:33633/" \
  particular/servicepulse:latest
```

**Features:**

- Built-in YARP reverse proxy (proxies `/api/` and `/monitoring-api/` to backends)
- Cross-platform (linux/amd64, linux/arm64)
- Environment variable configuration
- Can disable reverse proxy with `ENABLE_REVERSE_PROXY=false`

## 2. ServicePulse.Host - Windows Service (Legacy)

Uses **ServicePulse.Host** project (.NET Framework 4.8 + OWIN)

```cmd
REM Run interactively
ServicePulse.Host.exe --url="http://localhost:9090"

REM Install as Windows Service
ServicePulse.Host.exe --install --url="http://localhost:9090" --serviceControlUrl="http://localhost:33333/api" --serviceControlMonitoringUrl="http://localhost:33633"

REM Uninstall
ServicePulse.Host.exe --uninstall
```

**Features:**

- Self-hosted HTTP server via OWIN
- Runs as Windows Service or console app
- Requires URL ACL reservation (`netsh http add urlacl`)
- No reverse proxy - frontend makes direct CORS calls to ServiceControl

## 3. IIS Hosting (Extract Mode)

Extract static files for hosting in IIS or any web server:

```cmd
ServicePulse.Host.exe --extract --serviceControlUrl="http://localhost:33333/api" --serviceControlMonitoringUrl="http://localhost:33633" --outpath="C:\inetpub\wwwroot\servicepulse"
```

This creates a standalone SPA with URLs baked into `app.constants.js`. Requires ServiceControl to have CORS enabled.

## 4. Windows Installer

The `Setup` project creates an MSI/EXE installer that:

- Installs ServicePulse.Host as a Windows Service
- Configures URL ACL automatically
- Default port: 9090

## 5. ASP.NET Core in IIS

The modern **ServicePulse** project can be hosted in IIS via ASP.NET Core Module, providing reverse proxy capabilities.

## 6. Particular.PlatformSample.ServicePulse

Not a hosting option - this is a NuGet package that bundles ServicePulse for embedding in the Particular Platform Sample.

## Key Differences

| Option | Technology | Reverse Proxy | Platform |
|--------|-----------|---------------|----------|
| Docker/ASP.NET Core | .NET 8.0 | Yes (YARP) | Cross-platform |
| ServicePulse.Host | .NET 4.8 + OWIN | No | Windows only |
| IIS Extract | Static files | No | Any web server |

## See Also

- [HTTPS Configuration](https-configuration.md) - Configure direct HTTPS for either platform
- [Forwarded Headers Configuration](forwarded-headers.md) - Configure forwarded headers when behind a reverse proxy
- [Local HTTPS Testing](local-https-testing.md) - Test HTTPS configuration locally
