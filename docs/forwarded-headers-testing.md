# Local Testing Forwarded Headers (Without NGINX)

This guide explains how to test forwarded headers configuration for ServicePulse without using NGINX or Docker. This approach uses curl to manually send `X-Forwarded-*` headers directly to the application.

## Prerequisites

- ServicePulse built locally (see main README for build instructions)
- curl (included with Windows 10/11, Git Bash, or WSL)
- (Optional) For formatted JSON output: `npm install -g json` then pipe curl output through `| json`

### Building ServicePulse.Host (.NET Framework)

If testing the .NET Framework version, build ServicePulse.Host first:

```cmd
cd src\Frontend
npm install
npm run build
cd ..\..
xcopy /E /I /Y src\Frontend\dist src\ServicePulse.Host\app
cd src\ServicePulse.Host
dotnet build
```

## Application Reference

| Application                        | Project Directory       | Default Port | Configuration                                     |
|------------------------------------|-------------------------|--------------|---------------------------------------------------|
| ServicePulse (.NET 8)              | `src\ServicePulse`      | 5291         | Environment variables with `SERVICEPULSE_` prefix |
| ServicePulse.Host (.NET Framework) | `src\ServicePulse.Host` | 8081         | Command-line arguments with `--` prefix           |

### Configuration Settings

| Setting                  | .NET 8 Environment Variable                     | .NET Framework Argument              |
|--------------------------|-------------------------------------------------|--------------------------------------|
| Enable forwarded headers | `SERVICEPULSE_FORWARDEDHEADERS_ENABLED`         | `--forwardedheadersenabled=`         |
| Trust all proxies        | `SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES` | `--forwardedheaderstrustallproxies=` |
| Known proxies            | `SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES`    | `--forwardedheadersknownproxies=`    |
| Known networks           | `SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS`   | `--forwardedheadersknownnetworks=`   |

## How Forwarded Headers Work

When ServicePulse is behind a reverse proxy, the proxy sends headers to indicate the original request details:

- `X-Forwarded-For` - Original client IP address
- `X-Forwarded-Proto` - Original protocol (http/https)
- `X-Forwarded-Host` - Original host header

ServicePulse can be configured to trust these headers from specific proxies or trust all proxies.

### Trust Evaluation Rules

The middleware determines whether to process forwarded headers based on these rules:

1. **If `TrustAllProxies` = true**: All requests are trusted, headers are always processed
2. **If `TrustAllProxies` = false**: The caller's IP must match **either**:
   - **KnownProxies**: Exact IP address match (e.g., `127.0.0.1`, `::1`)
   - **KnownNetworks**: CIDR range match (e.g., `127.0.0.0/8`, `10.0.0.0/8`)

> **Important:** KnownProxies and KnownNetworks use **OR logic** - a match in either grants trust. The check is against the **immediate caller's IP** (the proxy connecting to ServicePulse), not the original client IP from `X-Forwarded-For`.

## Test Scenarios

Each scenario shows configuration for both platforms:

- **ServicePulse (.NET 8)**: Uses environment variables, run from `src\ServicePulse`
- **ServicePulse.Host (.NET Framework)**: Uses command-line arguments, run from `src\ServicePulse.Host\bin\Debug\net48`

> **Important:** For .NET 8, set environment variables in the same terminal where you run `dotnet run`. Environment variables are scoped to the terminal session.

### Scenario 0: Direct Access (No Proxy)

Test a direct request without any forwarded headers, simulating access without a reverse proxy.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081
```

**Test with curl (no forwarded headers):**

```cmd
curl http://localhost:5291/debug/request-info | json
curl http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "http",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
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

When no forwarded headers are sent, the request values remain unchanged.

### Scenario 1: Default Behavior (With Headers)

Test the default behavior when no forwarded headers configuration is set, but headers are sent.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
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

By default, forwarded headers are **enabled** and **all proxies are trusted**. This means any client can spoof `X-Forwarded-*` headers. This is suitable for development but should be restricted in production by configuring `KnownProxies` or `KnownNetworks`.

### Scenario 2: Trust All Proxies (Explicit)

Explicitly enable trust all proxies (same as default, but explicit configuration).

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersenabled=true --forwardedheaderstrustallproxies=true
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
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

The `scheme` is `https` (from `X-Forwarded-Proto`), `host` is `example.com` (from `X-Forwarded-Host`), and `remoteIpAddress` is `203.0.113.50` (from `X-Forwarded-For`) because all proxies are trusted. The `rawHeaders` are empty because the middleware consumed them.

### Scenario 3: Known Proxies Only

Only accept forwarded headers from specific IP addresses.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=127.0.0.1,::1
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownproxies=127.0.0.1,::1
```

> **Note:** Setting known proxies automatically disables trust all proxies. Both IPv4 (`127.0.0.1`) and IPv6 (`::1`) loopback addresses are included since curl may use either.

**Test with curl (from localhost - should work):**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["127.0.0.1", "::1"],
    "knownNetworks": []
  }
}
```

Headers are applied because the request comes from localhost, which is in the known proxies list. The `rawHeaders` are empty because the middleware consumed them.

### Scenario 4: Known Networks (CIDR)

Trust all proxies within a network range.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=127.0.0.0/8,::1/128

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownnetworks=127.0.0.0/8,::1/128
```

> **Note:** Both IPv4 (`127.0.0.0/8`) and IPv6 (`::1/128`) loopback networks are included since curl may use either.

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": [],
    "knownNetworks": ["127.0.0.0/8", "::1/128"]
  }
}
```

Headers are applied because the request comes from localhost, which falls within the known networks. The `rawHeaders` are empty because the middleware consumed them.

### Scenario 5: Unknown Proxy Rejected

Configure a known proxy that doesn't match the request source to verify headers are ignored.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=192.168.1.100
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownproxies=192.168.1.100
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "http",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
  },
  "rawHeaders": {
    "xForwardedFor": "203.0.113.50",
    "xForwardedProto": "https",
    "xForwardedHost": "example.com"
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["192.168.1.100"],
    "knownNetworks": []
  }
}
```

Headers are **ignored** because the request comes from localhost (`::1`), which is NOT in the known proxies list (`192.168.1.100`). Notice `scheme` is `http` (unchanged from original request). The `rawHeaders` still show the headers that were sent but not applied.

### Scenario 6: Unknown Network Rejected

Configure a known network that doesn't match the request source to verify headers are ignored.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=10.0.0.0/8,192.168.0.0/16

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownnetworks=10.0.0.0/8,192.168.0.0/16
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "http",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
  },
  "rawHeaders": {
    "xForwardedFor": "203.0.113.50",
    "xForwardedProto": "https",
    "xForwardedHost": "example.com"
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": [],
    "knownNetworks": ["10.0.0.0/8", "192.168.0.0/16"]
  }
}
```

Headers are **ignored** because the request comes from localhost (`::1`), which is NOT in the known networks (`10.0.0.0/8` or `192.168.0.0/16`). Notice `scheme` is `http` (unchanged from original request). The `rawHeaders` still show the headers that were sent but not applied.

### Scenario 7: Forwarded Headers Disabled

Completely disable forwarded headers processing.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=false
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersenabled=false
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "http",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
  },
  "rawHeaders": {
    "xForwardedFor": "203.0.113.50",
    "xForwardedProto": "https",
    "xForwardedHost": "example.com"
  },
  "configuration": {
    "enabled": false,
    "trustAllProxies": true,
    "knownProxies": [],
    "knownNetworks": []
  }
}
```

Headers are ignored because forwarded headers processing is disabled entirely. Notice `enabled` is `false` in the configuration. The `trustAllProxies` value defaults to `true` but is irrelevant when forwarded headers are disabled.

### Scenario 8: Proxy Chain (Multiple X-Forwarded-For Values)

Test how ServicePulse handles multiple proxies in the chain.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheaderstrustallproxies=true
```

**Test with curl (simulating a proxy chain):**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50, 10.0.0.1, 192.168.1.1" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50, 10.0.0.1, 192.168.1.1" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
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

The `X-Forwarded-For` header contains multiple IPs representing the proxy chain. When `TrustAllProxies` is `true`, `ForwardLimit` is set to `null` (no limit), so the middleware processes all IPs and returns the original client IP (`203.0.113.50`).

### Scenario 9: Proxy Chain with Known Proxies (ForwardLimit = 1)

Test how ServicePulse handles multiple proxies when `TrustAllProxies` is `false`. In this case, `ForwardLimit` remains at its default of `1`, so only the last proxy IP is processed.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=127.0.0.1,::1
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownproxies=127.0.0.1,::1
```

**Test with curl (simulating a proxy chain):**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50, 10.0.0.1, 192.168.1.1" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50, 10.0.0.1, 192.168.1.1" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "192.168.1.1"
  },
  "rawHeaders": {
    "xForwardedFor": "203.0.113.50, 10.0.0.1",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["127.0.0.1", "::1"],
    "knownNetworks": []
  }
}
```

When `TrustAllProxies` is `false`, `ForwardLimit` remains at its default of `1`. The middleware only processes the rightmost IP from the chain (`192.168.1.1`). The remaining IPs (`203.0.113.50, 10.0.0.1`) stay in the `X-Forwarded-For` header. Compare this to Scenario 8 where `TrustAllProxies = true` returns the original client IP.

### Scenario 10: Combined Known Proxies and Networks

Test using both `KnownProxies` and `KnownNetworks` together.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=192.168.1.100
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=127.0.0.0/8,::1/128

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownproxies=192.168.1.100 --forwardedheadersknownnetworks=127.0.0.0/8,::1/128
```

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["192.168.1.100"],
    "knownNetworks": ["127.0.0.0/8", "::1/128"]
  }
}
```

Headers are applied because the request comes from localhost (`::1`), which falls within the `::1/128` network even though it's not in the `knownProxies` list.

### Scenario 11: Partial Headers (Proto Only)

Test that each forwarded header is processed independently. Only sending `X-Forwarded-Proto` should update the scheme while leaving host and remoteIpAddress unchanged.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheaderstrustallproxies=true
```

**Test with curl (only X-Forwarded-Proto):**

```cmd
curl -H "X-Forwarded-Proto: https" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" http://localhost:8081/debug/request-info | json
```

**Expected output:**

```json
{
  "processed": {
    "scheme": "https",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
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

Only the `scheme` changed to `https`. The `host` remains `localhost:33333` and `remoteIpAddress` remains `::1` because those headers weren't sent. Each header is processed independently.

### Scenario 12: IPv4/IPv6 Mismatch

Demonstrates a common misconfiguration where only IPv4 localhost is configured but curl uses IPv6. This scenario shows why you should include both `127.0.0.1` and `::1` in your configuration.

**Start the application:**

**.NET 8:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=127.0.0.1
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=

dotnet run
```

**.NET Framework:**

```cmd
ServicePulse.Host.exe --url=http://localhost:8081 --forwardedheadersknownproxies=127.0.0.1
```

> **Note:** Only IPv4 `127.0.0.1` is configured, not IPv6 `::1`.

**Test with curl:**

```cmd
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:5291/debug/request-info | json
curl -H "X-Forwarded-Proto: https" -H "X-Forwarded-Host: example.com" -H "X-Forwarded-For: 203.0.113.50" http://localhost:8081/debug/request-info | json
```

**Expected output (if curl uses IPv6):**

```json
{
  "processed": {
    "scheme": "http",
    "host": "localhost:5291",
    "remoteIpAddress": "::1"
  },
  "rawHeaders": {
    "xForwardedFor": "203.0.113.50",
    "xForwardedProto": "https",
    "xForwardedHost": "example.com"
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["127.0.0.1"],
    "knownNetworks": []
  }
}
```

Headers are **ignored** because the request comes from `::1` (IPv6), but only `127.0.0.1` (IPv4) is in the known proxies list. This is a common gotcha - always include both IPv4 and IPv6 loopback addresses when testing locally, or use CIDR notation like `127.0.0.0/8` and `::1/128`.

> **Tip:** If your output shows headers were applied, curl is using IPv4. The behavior depends on your system's DNS resolution for `localhost`.

## Debug Endpoint

The `/debug/request-info` endpoint is only available in Development environment. It returns:

```json
{
  "processed": {
    "scheme": "https",
    "host": "example.com",
    "remoteIpAddress": "203.0.113.50"
  },
  "rawHeaders": {
    "xForwardedFor": "",
    "xForwardedProto": "",
    "xForwardedHost": ""
  },
  "configuration": {
    "enabled": true,
    "trustAllProxies": false,
    "knownProxies": ["127.0.0.1"],
    "knownNetworks": []
  }
}
```

| Section         | Field             | Description                                                      |
|-----------------|-------------------|------------------------------------------------------------------|
| `processed`     | `scheme`          | The request scheme after forwarded headers processing            |
| `processed`     | `host`            | The request host after forwarded headers processing              |
| `processed`     | `remoteIpAddress` | The client IP after forwarded headers processing                 |
| `rawHeaders`    | `xForwardedFor`   | Raw `X-Forwarded-For` header (empty if consumed by middleware)   |
| `rawHeaders`    | `xForwardedProto` | Raw `X-Forwarded-Proto` header (empty if consumed by middleware) |
| `rawHeaders`    | `xForwardedHost`  | Raw `X-Forwarded-Host` header (empty if consumed by middleware)  |
| `configuration` | `enabled`         | Whether forwarded headers middleware is enabled                  |
| `configuration` | `trustAllProxies` | Whether all proxies are trusted (security warning if true)       |
| `configuration` | `knownProxies`    | List of trusted proxy IP addresses                               |
| `configuration` | `knownNetworks`   | List of trusted CIDR network ranges                              |

### Key Diagnostic Questions

1. **Were headers applied?** - If `rawHeaders` are empty but `processed` values changed, the middleware consumed and applied them
2. **Why weren't headers applied?** - If `rawHeaders` still contain values, the middleware didn't trust the caller. Check `knownProxies` and `knownNetworks` in `configuration`
3. **Is forwarded headers enabled?** - Check `configuration.enabled`

## Cleanup (.NET 8 only)

After testing with .NET 8, clear the environment variables:

**Command Prompt (cmd):**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES=
set SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS=
```

**PowerShell:**

```powershell
$env:SERVICEPULSE_FORWARDEDHEADERS_ENABLED = $null
$env:SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES = $null
$env:SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES = $null
$env:SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS = $null
```

**Bash (Git Bash, WSL, Linux, macOS):**

```bash
unset SERVICEPULSE_FORWARDEDHEADERS_ENABLED
unset SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES
unset SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES
unset SERVICEPULSE_FORWARDEDHEADERS_KNOWNNETWORKS
```

> **Note:** .NET Framework uses command-line arguments, so no cleanup is needed - just stop the application.

## See Also

- [Forwarded Headers Configuration](forwarded-headers.md) - Configuration reference for forwarded headers
- [NGINX Testing](nginx-testing.md) - Testing with a real reverse proxy (NGINX)
- [Hosting Options](hosting-options.md) - General hosting configuration guide
