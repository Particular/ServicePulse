# Local Testing with NGINX Reverse Proxy

This guide provides scenario-based tests for ServicePulse behind an NGINX reverse proxy. Use this to verify:

- SSL/TLS termination at the reverse proxy
- Forwarded headers handling (`X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`)
- HTTP to HTTPS redirection
- HSTS (HTTP Strict Transport Security)

## Application Reference

| Application                        | Project Directory       | Default Port | Hostname                      | Configuration                                     |
|------------------------------------|-------------------------|--------------|-------------------------------|---------------------------------------------------|
| ServicePulse (.NET 8)              | `src\ServicePulse`      | 5291         | `servicepulse.localhost`      | Environment variables with `SERVICEPULSE_` prefix |
| ServicePulse.Host (.NET Framework) | `src\ServicePulse.Host` | 8081         | `servicepulse-host.localhost` | Command-line arguments with `--` prefix           |

## Configuration Reference

See [ServicePulse Security](https://docs.particular.net/servicepulse/security).

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [mkcert](https://github.com/FiloSottile/mkcert) for generating local development certificates
- ServicePulse built locally (see main README for build instructions)
- curl (included with Windows 10/11)

### Installing mkcert

**Windows (using Chocolatey):**

```cmd
choco install mkcert
```

**Windows (using Scoop):**

```cmd
scoop install mkcert
```

After installing, run `mkcert -install` to install the local CA in your system trust store.

## Setup

### Step 1: Create the Local Development Folder

Create a `.local` folder in the repository root (this folder is gitignored):

```cmd
mkdir .local
mkdir .local\certs
```

### Step 2: Generate SSL Certificates

Use mkcert to generate trusted local development certificates:

```cmd
mkcert -install
cd .local\certs
mkcert -cert-file servicepulse.pem -key-file servicepulse-key.pem servicepulse.localhost servicepulse-host.localhost localhost
```

### Step 3: Create Docker Compose Configuration

Create `.local/compose.yml`:

```yaml
services:
  reverse-proxy-servicepulse:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs/servicepulse.pem:/etc/nginx/certs/servicepulse.pem:ro
      - ./certs/servicepulse-key.pem:/etc/nginx/certs/servicepulse-key.pem:ro
```

### Step 4: Create NGINX Configuration

Create `.local/nginx.conf`:

```nginx
events { worker_connections 1024; }

http {
    # Shared SSL Settings
    ssl_certificate     /etc/nginx/certs/servicepulse.pem;
    ssl_certificate_key /etc/nginx/certs/servicepulse-key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # ServicePulse (.NET 8) - HTTPS
    server {
        listen 443 ssl;
        server_name servicepulse.localhost;

        location / {
            proxy_pass http://host.docker.internal:5291;

            # Forwarded Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
        }
    }

    # ServicePulse (.NET 8) - HTTP (for testing HTTP-to-HTTPS redirect)
    server {
        listen 80;
        server_name servicepulse.localhost;

        location / {
            proxy_pass http://host.docker.internal:5291;

            # Forwarded Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
        }
    }

    # ServicePulse.Host (.NET Framework) - HTTPS
    server {
        listen 443 ssl;
        server_name servicepulse-host.localhost;

        location / {
            proxy_pass http://host.docker.internal:8081;

            # Forwarded Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
        }
    }

    # ServicePulse.Host (.NET Framework) - HTTP (for testing HTTP-to-HTTPS redirect)
    server {
        listen 80;
        server_name servicepulse-host.localhost;

        location / {
            proxy_pass http://host.docker.internal:8081;

            # Forwarded Headers
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
        }
    }
}
```

### Step 5: Configure Hosts File

Add the following entries to your hosts file (`C:\Windows\System32\drivers\etc\hosts`):

```text
127.0.0.1 servicepulse.localhost
127.0.0.1 servicepulse-host.localhost
```

### Step 6: Start the NGINX Reverse Proxy

From the repository root:

```cmd
docker compose -f .local/compose.yml up -d
```

### Step 7: Final Directory Structure

After completing the setup, your `.local` folder should look like:

```text
.local/
├── compose.yml
├── nginx.conf
└── certs/
    ├── servicepulse.pem
    └── servicepulse-key.pem
```

## .NET Framework Prerequisites

ServicePulse.Host (.NET Framework) requires a URL ACL reservation.

### Build the Frontend and ServicePulse.Host

ServicePulse.Host embeds the frontend files into the assembly at build time. The easiest way to build everything is to run the full build script from the repository root:

```powershell
PowerShell -File .\build.ps1
```

Alternatively, build manually:

```cmd
cd src\Frontend
npm install
npm run build

cd ..\..
xcopy /E /I /Y src\Frontend\dist src\ServicePulse.Host\app
cd src\ServicePulse.Host
dotnet build
```

### Create URL ACL Reservation (Administrator)

Run in an **elevated (Administrator) command prompt**:

```cmd
netsh http add urlacl url=http://+:8081/ user=Everyone
```

## Test Scenarios

> [!IMPORTANT]
> ServicePulse must be running before testing. A 502 Bad Gateway error means NGINX cannot reach ServicePulse. Use `TRUSTALLPROXIES=true` for local Docker testing. The NGINX container's IP address varies based on Docker's network configuration (e.g., `172.x.x.x`), making it impractical to specify a fixed `KNOWNPROXIES` value.

### Scenario 1: HTTPS Access (.NET 8)

Verify that HTTPS is working through the reverse proxy.

**Clear environment variables and start ServicePulse:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=

cd src\ServicePulse
dotnet run
```

**Test with curl:**

```cmd
curl -k -v https://servicepulse.localhost 2>&1 | findstr /C:"HTTP/"
```

**Expected output:**

```text
< HTTP/1.1 200 OK
```

The request succeeds over HTTPS through the NGINX reverse proxy.

### Scenario 2: HTTPS Access (.NET Framework)

Verify that HTTPS is working through the reverse proxy with ServicePulse.Host.

> [!IMPORTANT]
> Complete the [.NET Framework Prerequisites](#net-framework-prerequisites) section first.

**Start ServicePulse.Host:**

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=http://localhost:8081
```

**Test with curl:**

```cmd
curl -k -v https://servicepulse-host.localhost 2>&1 | findstr /C:"HTTP/"
```

**Expected output:**

```text
< HTTP/1.1 200 OK
```

The request succeeds over HTTPS through the NGINX reverse proxy.

### Scenario 3: Forwarded Headers Processing (.NET 8)

Verify that forwarded headers are being processed correctly.

**Set environment variables and start ServicePulse:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=

cd src\ServicePulse
dotnet run
```

**Test with curl:**

```cmd
curl -k https://servicepulse.localhost/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "servicepulse.localhost",
    "remoteIpAddress": "172.x.x.x"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": true,
    "knownProxies": [],
    "knownNetworks": []
  }
}
```

The key indicators that forwarded headers are working:

- `processed.scheme` is `https` (from `X-Forwarded-Proto`)
- `processed.host` is `servicepulse.localhost` (from `X-Forwarded-Host`)
- `rawHeaders` are empty because the middleware consumed them (trusted proxy)

### Scenario 4: Forwarded Headers Processing (.NET Framework)

Verify that forwarded headers are being processed correctly with ServicePulse.Host.

**Start ServicePulse.Host with forwarded headers enabled:**

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheaderstrustallproxies=true
```

**Test with curl:**

```cmd
curl -k https://servicepulse-host.localhost/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "servicepulse-host.localhost",
    "remoteIpAddress": "172.x.x.x"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": true,
    "knownProxies": [],
    "knownNetworks": []
  }
}
```

### Scenario 5: HTTP to HTTPS Redirect (.NET 8)

Verify that HTTP requests are redirected to HTTPS.

**Set environment variables and start ServicePulse:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=true
set SERVICEPULSE_HTTPS_PORT=443
set SERVICEPULSE_HTTPS_ENABLEHSTS=

cd src\ServicePulse
dotnet run
```

**Test with curl:**

```cmd
curl -v http://servicepulse.localhost 2>&1 | findstr /i location
```

**Expected output:**

```text
< Location: https://servicepulse.localhost/
```

HTTP requests are redirected to HTTPS with a 307 (Temporary Redirect) status.

### Scenario 6: HTTP to HTTPS Redirect (.NET Framework)

Verify that HTTP requests are redirected to HTTPS with ServicePulse.Host.

**Start ServicePulse.Host with redirect enabled:**

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheaderstrustallproxies=true --httpsredirecthttptohttps=true --httpsport=443
```

**Test with curl:**

```cmd
curl -v http://servicepulse-host.localhost 2>&1 | findstr /i location
```

**Expected output:**

```text
< Location: https://servicepulse-host.localhost/
```

HTTP requests are redirected to HTTPS with a 307 (Temporary Redirect) status.

### Scenario 7: HSTS (.NET 8)

Verify that the HSTS header is included in HTTPS responses.

> [!NOTE]
> You must use `--environment Production` because HSTS is disabled in Development.

**Set environment variables and start ServicePulse:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=true

cd src\ServicePulse
dotnet run --environment Production
```

**Test with curl:**

```cmd
curl -k -v https://servicepulse.localhost 2>&1 | findstr /i strict-transport-security
```

**Expected output:**

```text
< Strict-Transport-Security: max-age=31536000
```

The HSTS header is present with the default max-age of 1 year.

### Scenario 8: HSTS (.NET Framework)

Verify that the HSTS header is included in HTTPS responses with ServicePulse.Host.

**Start ServicePulse.Host with HSTS enabled:**

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheaderstrustallproxies=true --httpsenablehsts=true
```

**Test with curl:**

```cmd
curl -k -v https://servicepulse-host.localhost 2>&1 | findstr /i strict-transport-security
```

**Expected output:**

```text
< Strict-Transport-Security: max-age=31536000
```

The HSTS header is present with the default max-age of 1 year.

## Cleanup

### Stop NGINX

```cmd
docker compose -f .local/compose.yml down
```

### Clear Environment Variables (.NET 8)

After testing, clear the environment variables:

**Command Prompt (cmd):**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=
```

**PowerShell:**

```powershell
$env:SERVICEPULSE_FORWARDEDHEADERS_ENABLED = $null
$env:SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES = $null
$env:SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS = $null
$env:SERVICEPULSE_HTTPS_PORT = $null
$env:SERVICEPULSE_HTTPS_ENABLEHSTS = $null
```

### Remove Hosts Entries (Optional)

If you no longer need the hostnames, remove these entries from your hosts file (`C:\Windows\System32\drivers\etc\hosts`):

```text
127.0.0.1 servicepulse.localhost
127.0.0.1 servicepulse-host.localhost
```

## Troubleshooting

### 502 Bad Gateway

This error means NGINX cannot reach ServicePulse. Check:

1. ServicePulse is running (`dotnet run` in `src/ServicePulse`)
2. ServicePulse is accessible directly: `curl http://localhost:5291`
3. Docker Desktop is running and `host.docker.internal` resolves correctly

### "Connection refused" errors

Ensure ServicePulse is running and listening on the expected port (5291 for .NET 8, 8081 for .NET Framework).

### Conflicting environment variables from direct HTTPS testing

If you previously tested [direct HTTPS](https-testing.md), you may have environment variables set that conflict with reverse proxy testing. Clear them before running:

**Command Prompt (cmd):**

```cmd
set SERVICEPULSE_HTTPS_ENABLED=
set SERVICEPULSE_HTTPS_CERTIFICATEPATH=
set SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=
```

**PowerShell:**

```powershell
$env:SERVICEPULSE_HTTPS_ENABLED = $null
$env:SERVICEPULSE_HTTPS_CERTIFICATEPATH = $null
$env:SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD = $null
```

For reverse proxy testing, ServicePulse should run on HTTP (not HTTPS) since NGINX handles SSL termination.

### Headers not being applied

1. Verify `SERVICEPULSE_FORWARDEDHEADERS_ENABLED` is `true`
2. Verify `SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES` is `true` (for local Docker testing)
3. Use the `/debug/request-info` endpoint to check current settings

### Certificate errors in browser

1. Ensure mkcert's root CA is installed: `mkcert -install`
2. Restart your browser after installing the root CA

### Docker networking issues

If using Docker Desktop on Windows with WSL2:

- Ensure `host.docker.internal` resolves correctly
- Check that the ServicePulse port is not blocked by Windows Firewall

### Debug endpoint not available

The `/debug/request-info` endpoint is only available:

- ServicePulse (.NET 8): When running in Development environment
- ServicePulse.Host (.NET Framework): In DEBUG builds when running interactively

## See Also

- [HTTPS Configuration](https-configuration.md) - Configuration reference for all HTTPS settings
- [Forwarded Headers Configuration](forwarded-headers.md) - Configuration reference for all forwarded headers settings
- [HTTPS Testing](https-testing.md) - Testing direct HTTPS without a reverse proxy
- [Forwarded Headers Testing](forwarded-headers-testing.md) - Testing forwarded headers without a reverse proxy
- [Authentication Testing](authentication-testing.md) - Testing OIDC authentication
