# Local Testing with Direct HTTPS

This guide provides scenario-based tests for ServicePulse's direct HTTPS features. Use this to verify HTTPS behavior without a reverse proxy.

> [!NOTE] HTTP to HTTPS redirection (`RedirectHttpToHttps`) is designed for reverse proxy scenarios where the proxy forwards HTTP requests to ServicePulse. When running with direct HTTPS, ServicePulse only binds to a single port (HTTPS). To test HTTP to HTTPS redirection, see [Reverse Proxy Testing](nginx-testing.md). HSTS should not be tested on localhost because browsers cache the HSTS policy, which could break other local development. To test HSTS, use the [NGINX reverse proxy setup](nginx-testing.md) with a custom hostname (`servicepulse.localhost`).

## Application Reference

| Application                        | Project Directory       | Default Port | Configuration                                     |
|------------------------------------|-------------------------|--------------|---------------------------------------------------|
| ServicePulse (.NET 8)              | `src\ServicePulse`      | 5291         | Environment variables with `SERVICEPULSE_` prefix |
| ServicePulse.Host (.NET Framework) | `src\ServicePulse.Host` | 9090         | Command-line arguments with `--` prefix           |

## HTTPS Configuration Reference

See [ServicePulse TLS](https://docs.particular.net/servicepulse/security/configuration/tls).

## Prerequisites

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

### Step 2: Generate PFX Certificates

Kestrel used in the .NET 8 host requires certificates in PFX format. Use mkcert to generate them:

```cmd
mkcert -install
cd .local\certs
mkcert -p12-file localhost.pfx -pkcs12 localhost 127.0.0.1 ::1 servicepulse
```

When prompted for a password, you can use an empty password by pressing Enter, or set a password and note it for the configuration step.

## .NET Framework Prerequisites

ServicePulse.Host (.NET Framework) uses Windows HttpListener which requires additional setup.

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

> [!NOTE]
> The frontend files must be copied to `src/ServicePulse.Host/app/` *before* building because they are embedded into the assembly at compile time.

### Import Certificate to Windows Store (Administrator)

The certificate must be imported into the Windows certificate store:

```powershell
$password = ConvertTo-SecureString -String "" -Force -AsPlainText
Import-PfxCertificate -FilePath ".local\certs\localhost.pfx" -CertStoreLocation Cert:\LocalMachine\My -Password $password
```

### Get Certificate Thumbprint (Administrator)

```powershell
(Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*localhost*" }).Thumbprint
```

Copy this thumbprint for the next step.

### Bind Certificate to Port (Administrator)

Run these commands in an **elevated (Administrator) command prompt**:

```cmd
netsh http add sslcert ipport=0.0.0.0:9090 certhash=YOUR_THUMBPRINT appid={00000000-0000-0000-0000-000000000000}
netsh http add urlacl url=https://+:9090/ user=Everyone
```

Replace `YOUR_THUMBPRINT` with the thumbprint from the previous step.

## Test Scenarios

### Scenario 1: Basic HTTPS Connectivity (.NET 8)

Verify that HTTPS is working with a valid certificate.

**Set environment variables and start ServicePulse:**

```cmd
set SERVICEPULSE_HTTPS_ENABLED=true
set SERVICEPULSE_HTTPS_CERTIFICATEPATH=C:\path\to\repo\.local\certs\localhost.pfx
set SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=

cd src\ServicePulse
dotnet run
```

**Test with curl:**

```cmd
curl --ssl-no-revoke -v https://localhost:5291 2>&1 | findstr /C:"HTTP/" /C:"SSL"
```

> [!NOTE]
> The `--ssl-no-revoke` flag is required on Windows because mkcert certificates don't have CRL distribution points, causing `CRYPT_E_NO_REVOCATION_CHECK` errors.

**Expected output:**

```text
* schannel: SSL/TLS connection renegotiated
< HTTP/1.1 200 OK
```

The request succeeds over HTTPS. The exact SSL output varies by curl version, but you should see `HTTP/1.1 200 OK` confirming success.

### Scenario 2: HTTP Disabled (.NET 8)

Verify that HTTP requests fail when only HTTPS is enabled.

**Set environment variables and start ServicePulse** (same as Scenario 1):

```cmd
set SERVICEPULSE_HTTPS_ENABLED=true
set SERVICEPULSE_HTTPS_CERTIFICATEPATH=C:\path\to\repo\.local\certs\localhost.pfx
set SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=

cd src\ServicePulse
dotnet run
```

**Test with curl (HTTP):**

```cmd
curl http://localhost:5291
```

**Expected output:**

```text
curl: (52) Empty reply from server
```

HTTP requests fail because Kestrel is listening for HTTPS but receives plaintext HTTP, which it cannot process. The server closes the connection without responding.

### Scenario 3: Basic HTTPS Connectivity (.NET Framework)

Verify that HTTPS is working with ServicePulse.Host.

> [!NOTE]
> Complete the [.NET Framework Prerequisites](#net-framework-prerequisites) section first.

**Start ServicePulse.Host:**

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=https://localhost:9090 --httpsenabled=true
```

**Test with curl:**

```cmd
curl --ssl-no-revoke -v https://localhost:9090 2>&1 | findstr /C:"HTTP/" /C:"SSL"
```

**Expected output:**

```text
* schannel: SSL/TLS connection renegotiated
< HTTP/1.1 200 OK
```

The request succeeds over HTTPS. You should see `HTTP/1.1 200 OK` confirming success.

### Scenario 4: HTTP Disabled (.NET Framework)

Verify that HTTP requests fail when HTTPS is configured.

**Start ServicePulse.Host** (same as Scenario 3):

```cmd
cd src\ServicePulse.Host\bin\Debug\net48
ServicePulse.Host.exe --url=https://localhost:9090 --httpsenabled=true
```

**Test with curl (HTTP):**

```cmd
curl http://localhost:9090
```

**Expected output (one of):**

```text
curl: (52) Empty reply from server
curl: (56) Recv failure: Connection was reset
```

HTTP requests fail because HttpListener is configured for HTTPS only. The exact error varies depending on timing.

## Cleanup

### Clear Environment Variables (.NET 8)

After testing, clear the environment variables:

**Command Prompt (cmd):**

```cmd
set SERVICEPULSE_HTTPS_ENABLED=
set SERVICEPULSE_HTTPS_CERTIFICATEPATH=
set SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD=
set SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS=
set SERVICEPULSE_HTTPS_PORT=
set SERVICEPULSE_HTTPS_ENABLEHSTS=
```

**PowerShell:**

```powershell
$env:SERVICEPULSE_HTTPS_ENABLED = $null
$env:SERVICEPULSE_HTTPS_CERTIFICATEPATH = $null
$env:SERVICEPULSE_HTTPS_CERTIFICATEPASSWORD = $null
$env:SERVICEPULSE_HTTPS_REDIRECTHTTPTOHTTPS = $null
$env:SERVICEPULSE_HTTPS_PORT = $null
$env:SERVICEPULSE_HTTPS_ENABLEHSTS = $null
```

### Cleanup (.NET Framework)

To remove the SSL binding and URL ACL:

```cmd
netsh http delete sslcert ipport=0.0.0.0:9090
netsh http delete urlacl url=https://+:9090/
```

To remove the certificate from the store:

```powershell
Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*localhost*" } | Remove-Item
```

## Troubleshooting

### Certificate not found

Ensure the `SERVICEPULSE_HTTPS_CERTIFICATEPATH` is an absolute path and the file exists.

### Certificate password incorrect

If you set a password when generating the PFX, ensure it matches the configured password.

### Certificate errors in browser

1. Ensure mkcert's root CA is installed: `mkcert -install`
2. Restart your browser after installing the root CA

### CRYPT_E_NO_REVOCATION_CHECK error in curl

Windows curl fails to check certificate revocation for mkcert certificates because they don't have CRL distribution points. Use the `--ssl-no-revoke` flag:

```cmd
curl --ssl-no-revoke https://localhost:5291
```

### Port already in use

Ensure no other process is using the ServicePulse port (default 5291 for .NET 8, 9090 for .NET Framework).

### HttpListener Access Denied (.NET Framework)

Ensure you've created the URL ACL reservation:

```cmd
netsh http add urlacl url=https://+:9090/ user=Everyone
```

### SSL Binding Failed (.NET Framework)

Ensure:

1. The certificate is imported to `Cert:\LocalMachine\My`
2. The thumbprint is correct (no spaces)
3. You're running as Administrator

### No response from ServicePulse.Host HTTPS (.NET Framework)

If `curl --ssl-no-revoke https://localhost:9090` hangs with no response:

1. **Verify the application started successfully:**
   - Check the console output for any errors when starting ServicePulse.Host.exe
   - The application should display a message indicating it's listening

2. **Verify the SSL certificate binding:**

   ```cmd
   netsh http show sslcert ipport=0.0.0.0:9090
   ```

   The output should show the certificate hash and application ID. If not found, re-add the binding.

3. **Verify the URL ACL:**

   ```cmd
   netsh http show urlacl url=https://+:9090/
   ```

   The output should show the reserved URL. If not found, re-add the URL ACL.

4. **Check for thumbprint issues:**
   - Thumbprints must have no spaces
   - The PowerShell command in the prerequisites outputs the thumbprint without spaces
   - Example: `A1B2C3D4E5F6...` (not `A1 B2 C3 D4 E5 F6...`)

5. **Verify the certificate is valid:**

   ```powershell
   Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*localhost*" } | Select-Object Subject, Thumbprint, NotBefore, NotAfter
   ```

6. **Try removing and re-adding the SSL binding:**

   ```cmd
   netsh http delete sslcert ipport=0.0.0.0:9090
   netsh http add sslcert ipport=0.0.0.0:9090 certhash=YOUR_THUMBPRINT appid={00000000-0000-0000-0000-000000000000}
   ```

7. **Check Windows Event Viewer:**
   - Open Event Viewer (`eventvwr.msc`)
   - Navigate to Windows Logs > Application
   - Look for errors related to HttpListener or SSL

## See Also

- [HTTPS Configuration](https-configuration.md) - Configuration reference for all HTTPS settings
- [Forwarded Headers Configuration](forwarded-headers.md) - Configure forwarded headers when behind a reverse proxy
- [Forwarded Headers Testing](forwarded-headers-testing.md) - Testing forwarded headers without a reverse proxy
- [Reverse Proxy Testing](nginx-testing.md) - Testing with NGINX reverse proxy
