# Local Testing Authentication

This guide provides scenario-based tests for ServicePulse's OIDC authentication. Use this to verify authentication behavior during local development.

## Prerequisites

- ServicePulse built locally (see main README for build instructions)
- ServiceControl instance running (provides authentication configuration) - See the hosting guide in ServiceControl docs for more info.
- **HTTPS configured** - Authentication requires HTTPS for secure token transmission. See [HTTPS Configuration](https-configuration.md) or [Reverse Proxy Testing](nginx-testing.md) for setup options.
- (Optional) An OIDC identity provider for testing authenticated scenarios

### Building the Frontend

```cmd
cd src\Frontend
npm install
npm run build
```

## How Authentication Works

ServicePulse fetches authentication configuration from ServiceControl:

```text
GET {serviceControlUrl}/api/authentication/configuration
```

The response determines whether authentication is required:

```json
{
  "enabled": true,
  "client_id": "servicepulse",
  "authority": "https://your-idp.example.com",
  "api_scopes": "[\"api\"]",
  "audience": "servicecontrol-api"
}
```

When `enabled` is `true`, ServicePulse redirects users to the identity provider for login.

## Test Scenarios

### Scenario 1: Authentication Disabled (Default)

Verify that ServicePulse works without authentication when ServiceControl has auth disabled.

#### Option A: Using Mocks (No ServiceControl Required)

Use the mock scenario for frontend development without running ServiceControl.

**Start with mocks:**

```cmd
cd src\Frontend
set VITE_MOCK_SCENARIO=auth-disabled
npm run dev:mocks
```

**Test in browser:**

1. Open `http://localhost:5173`
2. ServicePulse should load directly without any login prompt
3. The user profile menu should NOT appear in the header
4. Console should show: `Loading mock scenario: auth-disabled`

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication
```

#### Option B: Using Real ServiceControl

**Prerequisites:**

- ServiceControl running with authentication disabled (default)

**Start ServicePulse:**

```cmd
cd src\ServicePulse
dotnet run
```

**Test in browser:**

1. Open `http://localhost:5291`
2. ServicePulse should load directly without any login prompt
3. The user profile menu should NOT appear in the header

**Verify with curl:**

```cmd
curl http://localhost:5291/js/app.constants.js
```

**Expected:** The constants file loads successfully. Access to ServicePulse does not require authentication.

### Scenario 2: Verify Authentication Configuration Endpoint

Test that ServiceControl returns the correct authentication configuration for ServicePulse.

#### Option A: Using Mocks (No ServiceControl Required)

Use the mock scenario to verify the auth configuration endpoint returns the expected response shape. Note: The app will attempt to redirect to the identity provider, which will fail without a real IdP - this is expected behavior.

**Start with mocks:**

```cmd
cd src\Frontend
set VITE_MOCK_SCENARIO=auth-enabled
npm run dev:mocks
```

**Test in browser:**

1. Open `http://localhost:5173`
2. Open Developer Tools > Network tab
3. Look for request to `/api/authentication/configuration`
4. Verify response matches the expected mock values below

**Expected mock response:**

```json
{
  "enabled": true,
  "client_id": "servicepulse-test",
  "authority": "https://login.microsoftonline.com/test-tenant-id/v2.0",
  "api_scopes": "[\"api://servicecontrol/access_as_user\"]",
  "audience": "api://servicecontrol"
}
```

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-enabled
```

#### Option B: Using Real ServiceControl

**Configure and start ServiceControl:**

See ServiceControl docs for correct setup

**Test with curl:**

```cmd
curl http://localhost:33333/api/authentication/configuration | json
```

**Expected output:**

```json
{
  "enabled": true,
  "client_id": "{servicepulse-client-id}",
  "authority": "https://login.microsoftonline.com/{tenant-id}/v2.0",
  "audience": "api://servicecontrol",
  "api_scopes": "[\"api://servicecontrol/access_as_user\"]"
}
```

The configuration endpoint is accessible without authentication and returns all fields ServicePulse needs to initiate the OIDC flow.

### Scenario 3: Authentication Enabled (Browser Flow)

Verify the OIDC login flow when authentication is enabled.

#### Using Mocks (No ServiceControl Required)

Use the mock scenario to simulate an authenticated user state. This bypasses the actual OIDC redirect flow and injects a mock token directly.

**Start with mocks:**

```cmd
cd src\Frontend
set VITE_MOCK_SCENARIO=auth-authenticated
npm run dev:mocks
```

**Test in browser:**

1. Open `http://localhost:5173`
2. Dashboard should load directly (no login redirect)
3. User profile menu should appear in the header
4. Check Developer Tools > Application > Session Storage for `auth_token`

**Expected behavior:**

- Console shows: `Existing user session found { name: 'Test User', email: 'test.user@example.com' }`
- Console shows: `User authenticated successfully`
- Dashboard loads without redirect

**Check Session Storage (Developer Tools > Application > Session Storage):**

Key: `oidc.user:https://login.microsoftonline.com/test-tenant-id/v2.0:servicepulse-test`

```json
{
  "access_token": "mock-access-token-for-testing",
  "token_type": "Bearer",
  "profile": {
    "name": "Test User",
    "email": "test.user@example.com",
    "sub": "user-123"
  }
}
```

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

#### Using Real ServiceControl and Identity Provider

**Prerequisites:**

- ServiceControl running with authentication enabled (see Scenario 2)
- OIDC identity provider configured (Microsoft Entra ID, Okta, Auth0, etc.)

**Start ServicePulse:**

```cmd
cd src\ServicePulse
dotnet run
```

**Test in browser:**

1. Open `http://localhost:5291`
2. ServicePulse should show a loading screen while fetching auth config
3. Browser should redirect to the identity provider login page
4. Enter valid credentials (if not already authenticated in current session)
5. After successful login, browser redirects back to ServicePulse
6. ServicePulse dashboard should load
7. User profile menu should appear in the header showing user name and email

### Scenario 4: Token Included in API Requests

Verify that authenticated requests include the Bearer token.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

**Manual test in browser:**

Prerequisites: Completed Scenario 3 (logged in successfully)

1. Open browser Developer Tools (F12)
2. Go to the Network tab
3. Navigate to different pages in ServicePulse (Dashboard, Failed Messages, etc.)
4. Click on API requests to ServiceControl (e.g., `/api/endpoints`)
5. Check the Request Headers

**Expected:** Each API request includes:

```text
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Test with curl (using a token):**

If you have obtained a token (e.g., from browser Developer Tools > Application > Session Storage > `oidc.user:*`), you can test API requests directly:

```cmd
rem Set your token (copy from browser session storage)
set TOKEN=eyJhbGciOiJSUzI1NiIs...

rem Test against ServiceControl directly
curl -v -H "Authorization: Bearer %TOKEN%" http://localhost:33333/api/endpoints

rem Test through ServicePulse reverse proxy
curl -v -H "Authorization: Bearer %TOKEN%" http://localhost:5291/api/endpoints
```

**Expected:** Both requests return `200 OK` with endpoint data (JSON array).

### Scenario 5: Unauthenticated API Access Blocked

Verify that API requests without a token are rejected when auth is enabled.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-unauthenticated
```

**Manual test with curl (no token):**

Prerequisites: ServiceControl running with authentication enabled

```cmd
curl -v http://localhost:33333/api/endpoints
```

**Expected output:**

```text
HTTP/1.1 401 Unauthorized
```

The request is rejected because no Bearer token was provided.

### Scenario 6: Session Persistence

Verify that the session persists within a browser tab.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

**Manual test in browser:**

Prerequisites: Completed Scenario 3 (logged in successfully)

1. After logging in, note that ServicePulse is working
2. Refresh the page (F5)
3. ServicePulse should reload without requiring login again
4. Navigate between different pages

**Expected:** The session persists. User remains authenticated without re-login.

### Scenario 7: Session Isolation Between Tabs

Verify that sessions are isolated between browser tabs.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

The automated test verifies that the auth token is stored in `sessionStorage` (tab-specific) and NOT in `localStorage` (shared across tabs).

**Manual test in browser:**

Prerequisites: Completed Scenario 3 (logged in successfully in one tab)

1. Open a new browser tab
2. Navigate to `http://localhost:5291`
3. The new tab should redirect to the identity provider for login

**Expected:** Each tab requires its own login because tokens are stored in `sessionStorage` (tab-specific).

> **Note:** If your identity provider maintains a session (SSO), the login may complete automatically without prompting for credentials.

### Scenario 8: Logout Flow

Verify that logout clears the session and redirects to the logged-out page.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

**Manual test in browser:**

Prerequisites: Completed Scenario 3 (logged in successfully)

1. Click on the user profile menu in the header
2. Click "Log out"
3. Browser should redirect to the identity provider's logout page
4. After IdP logout, browser redirects to `http://localhost:5291/#/logged-out`
5. The logged-out page displays:
   - "You have been signed out" message
   - "Sign in again" button
6. Click "Sign in again" to initiate a new login

**Expected:** The session is cleared. User sees the logged-out confirmation page and can sign in again.

**Test with curl (verify logged-out page is accessible without auth):**

```cmd
curl http://localhost:5291/#/logged-out
```

**Expected:** The logged-out page should be accessible without authentication (it's an anonymous route).

### Scenario 9: Silent Token Renewal

Verify that tokens are renewed automatically before expiration.

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-full-flow
```

The automated test verifies that the UserManager is initialized with silent renewal support (mocked `signinSilent` method).

**Manual test in browser:**

Prerequisites:
- Completed Scenario 3 (logged in successfully)
- Identity provider configured with short-lived access tokens (for testing)

1. Open browser Developer Tools (F12)
2. Go to the Network tab
3. Filter by "silent-renew"
4. Leave ServicePulse open and wait for the token to approach expiration
5. Watch for a request to `silent-renew.html`

**Expected:** Before the token expires, a silent renewal request is made via an iframe. The token is refreshed without user interaction.

> **Note:** Silent renewal timing depends on your identity provider's token lifetime configuration.

### Scenario 10: Silent Renewal Failure

Verify behavior when silent renewal fails (e.g., IdP session expired).

**Run automated tests:**

```cmd
cd src\Frontend
npx vitest run ./test/specs/authentication/auth-renewal-failure
```

The automated test uses a mock where `signinSilent` fails, verifying the app handles renewal failures gracefully.

**Manual test in browser:**

Prerequisites:

- Completed Scenario 3 (logged in successfully)
- Identity provider session expired or revoked

1. Log in to ServicePulse
2. In a separate tab, log out from your identity provider (or wait for IdP session to expire)
3. Return to ServicePulse and wait for token renewal to be attempted
4. Or refresh the page

**Expected:** ServicePulse detects the authentication failure and redirects to the identity provider login page.

### Scenario 11: Invalid Redirect URI

Verify error handling when redirect URI is misconfigured.

**Prerequisites:**

- ServiceControl with authentication enabled
- Redirect URI in identity provider does NOT match ServicePulse URL

**Test in browser:**

1. Open `http://localhost:5291`
2. Browser redirects to identity provider
3. After login, identity provider rejects the redirect

**Expected:** Identity provider shows an error about invalid redirect URI. This indicates misconfiguration in the IdP application registration.

**Automated test:**

```bash
cd src/Frontend
npx vitest run test/specs/authentication/auth-invalid-redirect.spec.ts
```

Note: The automated test verifies the app's behavior when OAuth callbacks fail. The actual "invalid redirect URI" error is displayed by the identity provider itself, not the application.

### Scenario 12: YARP Reverse Proxy Token Forwarding

Verify that the internal YARP reverse proxy forwards Bearer tokens to ServiceControl.

**Prerequisites:**

- ServiceControl running with authentication enabled (see Scenario 2)
- ServicePulse running with reverse proxy enabled (default)
- Completed Scenario 3 (logged in successfully)

**How YARP works:**

When the reverse proxy is enabled (default), ServicePulse serves the frontend at `https://localhost:5291` and proxies API requests:

- `/api/*` → forwarded to ServiceControl (e.g., `http://localhost:33333/`)
- `/monitoring-api/*` → forwarded to Monitoring instance

YARP automatically forwards the `Authorization` header to downstream services.

**Test in browser:**

1. Open browser Developer Tools (F12) > Network tab
2. Navigate to the Dashboard or any page that loads data
3. Find a request to `/api/endpoints` (or similar)
4. Verify the request URL is `/api/endpoints` (relative, through YARP)
5. Check the Request Headers include `Authorization: Bearer ...`
6. Verify the response is `200 OK` with data (not `401 Unauthorized`)

**Expected:** Requests through the YARP proxy include the Bearer token and ServiceControl accepts them.

**Verify reverse proxy is enabled:**

```cmd
curl https://localhost:5291/js/app.constants.js
```

When reverse proxy is enabled, `service_control_url` should be `"/api/"` (relative path).

**Automated test:**

```bash
cd src/Frontend
npx vitest run test/specs/authentication/auth-yarp-proxy.spec.ts
```

### Scenario 13: Direct ServiceControl Access (Reverse Proxy Disabled)

Verify authentication works when the reverse proxy is disabled and the frontend connects directly to ServiceControl.

**Prerequisites:**

- ServiceControl running with authentication enabled
- OIDC identity provider configured

**Start ServicePulse with reverse proxy disabled:**

```cmd
set ENABLE_REVERSE_PROXY=false
cd src\ServicePulse
dotnet run
```

**Verify configuration:**

```cmd
curl https://localhost:5291/js/app.constants.js
```

When reverse proxy is disabled, `service_control_url` should be the full ServiceControl URL (e.g., `"http://localhost:33333/api/"`).

**Test in browser:**

1. Open `https://localhost:5291`
2. Complete the login flow
3. Open Developer Tools > Network tab
4. Navigate to pages that load data
5. Verify requests go directly to ServiceControl URL (not `/api/`)
6. Verify requests include `Authorization: Bearer ...` header
7. Verify responses are successful

**Expected:** Direct requests to ServiceControl include the Bearer token and are accepted.

**Automated test:**

```bash
cd src/Frontend
npx vitest run test/specs/authentication/auth-direct-access.spec.ts
```

### Scenario 14: Forwarded Headers with Authentication

Verify that forwarded headers work correctly with authentication when behind a reverse proxy (e.g., NGINX).

**Prerequisites:**

- ServiceControl running with authentication enabled
- External reverse proxy (NGINX) configured (see [Reverse Proxy Testing](nginx-testing.md))
- ServicePulse configured to trust forwarded headers

**Configure ServicePulse:**

```cmd
set SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true
set SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true
cd src\ServicePulse
dotnet run
```

**Test in browser:**

1. Access ServicePulse through the external reverse proxy (e.g., `https://servicepulse.localhost/`)
2. Complete the login flow
3. Verify the OAuth redirect URI uses the correct external URL
4. Verify ServicePulse loads successfully after login

**Expected:** The forwarded headers (`X-Forwarded-Proto`, `X-Forwarded-Host`) are processed correctly, and OAuth redirects use the external URL.

### Scenario 15: Auth Configuration Endpoint Unavailable

Verify graceful handling when ServiceControl is unavailable during authentication configuration fetch.

**Prerequisites:**

- ServicePulse running
- ServiceControl NOT running

**Test in browser:**

1. Stop ServiceControl
2. Open `https://localhost:5291`
3. Observe the loading behavior

**Expected:** ServicePulse should display an error message indicating it cannot connect to ServiceControl, rather than crashing or showing a blank screen.

**Automated test:**

```bash
cd src/Frontend
npx vitest run test/specs/authentication/auth-config-unavailable.spec.ts
```

Note: The automated tests verify the app handles auth config endpoint errors gracefully by falling back to "auth disabled" mode, allowing users to still access the dashboard.

### Scenario 16: OAuth Callback Error Handling

Verify that OAuth errors returned in the callback are handled gracefully.

**Prerequisites:**

- ServiceControl running with authentication enabled
- OIDC identity provider configured

**Test by simulating an error:**

1. Manually navigate to a URL with an error parameter:

   ```text
   https://localhost:5291/?error=access_denied&error_description=User%20cancelled%20the%20login
   ```

2. Observe the behavior

**Expected:** ServicePulse should display the error message to the user and allow them to retry authentication.

**Automated test:**

```bash
cd src/Frontend
npx vitest run test/specs/authentication/auth-callback-error.spec.ts
```

### Scenario 17: Monitoring Instance Authentication

Verify that authentication tokens are forwarded to the Monitoring instance as well.

**Prerequisites:**

- ServiceControl running with authentication enabled
- ServiceControl Monitoring instance running
- Completed Scenario 3 (logged in successfully)

**Test in browser:**

1. Navigate to the Monitoring tab in ServicePulse
2. Open Developer Tools > Network tab
3. Find requests to `/monitoring-api/*`
4. Verify requests include `Authorization: Bearer ...` header
5. Verify Monitoring data loads successfully

**Expected:** Monitoring API requests through YARP include the Bearer token and return data successfully.

## Development Mode with Mocks

For frontend development without a real identity provider, you can use MSW (Mock Service Worker) to mock the authentication endpoint.

**Start with mocks:**

```cmd
cd src\Frontend
npm run dev:mocks
```

**Mock authentication disabled:**

The default mock configuration returns authentication as disabled. To test authenticated scenarios, you'll need to add mock handlers for the auth configuration endpoint.

## Automated Testing

Automated tests for authentication use **Vitest + MSW** (Mock Service Worker) to test auth flows without requiring a real identity provider.

**Approach:**

- Mock the `/api/authentication/configuration` endpoint to return auth-enabled config
- Mock the `oidc-client-ts` UserManager to simulate authenticated users
- Test UI behavior (profile menu appears, logout works, etc.)
- Test that API requests include the Bearer token

**Run automated auth tests:**

```cmd
cd src\Frontend
npm run test:component
```

See `src/Frontend/test/preconditions/` for auth-related test setup factories.

## Troubleshooting

### "Authentication required" but no redirect

**Possible causes:**

1. ServiceControl auth configuration missing `authority` or `client_id`
2. OIDC library failed to initialize

**Solution:** Check browser console for JavaScript errors. Verify ServiceControl auth configuration is complete.

### Redirect loop between ServicePulse and IdP

**Possible causes:**

1. Redirect URI mismatch (trailing slash difference)
2. Token validation failing

**Solution:** Ensure redirect URI in IdP exactly matches `http://localhost:5291/` (with or without trailing slash consistently).

### "CORS error" in browser console

**Possible causes:**

1. Identity provider doesn't allow requests from `http://localhost:5291`
2. ServiceControl doesn't have CORS configured for the ServicePulse origin

**Solution:** Configure CORS in your identity provider to allow the ServicePulse origin.

### Token not refreshing

**Possible causes:**

1. `offline_access` scope not granted
2. Third-party cookies blocked by browser
3. `silent-renew.html` not accessible

**Solution:**

1. Ensure `offline_access` is in the requested scopes
2. Check browser settings for third-party cookie restrictions
3. Verify `http://localhost:5291/silent-renew.html` returns successfully

### API requests still failing after login

**Possible causes:**

1. Token audience doesn't match ServiceControl's expected audience
2. Token scopes don't include required API scopes
3. Token signature validation failing

**Solution:** Verify identity provider configuration matches ServiceControl's expected values for audience and scopes.

### 401 errors through YARP reverse proxy

**Possible causes:**

1. ServiceControl not configured to accept the token
2. Token audience mismatch between ServicePulse and ServiceControl configuration
3. CORS issues when ServiceControl and ServicePulse are on different origins

**Solution:**

1. Verify ServiceControl is configured with matching authentication settings
2. Check that the `audience` in ServiceControl matches the token's audience claim
3. When using reverse proxy (default), requests go to the same origin so CORS should not be an issue

### Forwarded headers not working

**Possible causes:**

1. Forwarded headers middleware not enabled
2. Request not coming from a trusted proxy
3. Headers being stripped by intermediate proxy

**Solution:**

1. Ensure `SERVICEPULSE_FORWARDEDHEADERS_ENABLED=true`
2. Configure trusted proxies: `SERVICEPULSE_FORWARDEDHEADERS_KNOWNPROXIES` or `SERVICEPULSE_FORWARDEDHEADERS_TRUSTALLPROXIES=true`
3. Check that your reverse proxy is sending `X-Forwarded-Proto`, `X-Forwarded-Host`, and `X-Forwarded-For` headers

### OAuth redirect uses wrong URL behind proxy

**Possible causes:**

1. Forwarded headers not being processed
2. Identity provider redirect URI doesn't match the external URL

**Solution:**

1. Enable and configure forwarded headers (see above)
2. Update the redirect URI in your identity provider to match the external URL (e.g., `https://servicepulse.example.com/`)

## Browser Developer Tools Tips

### Viewing Token Contents

1. Open Developer Tools > Application tab
2. Expand Session Storage
3. Find the `oidc.user:` key
4. The stored object contains the access token and user info

### Decoding JWT Tokens

Copy the access token and paste it into [jwt.io](https://jwt.io) to view:

- Header (algorithm, key ID)
- Payload (claims, scopes, expiration)
- Signature

### Monitoring Auth Requests

1. Open Developer Tools > Network tab
2. Filter by domain of your identity provider
3. Watch for:
   - `/authorize` - Initial login redirect
   - `/token` - Token exchange
   - `/userinfo` - User profile fetch (if enabled)

## See Also

- [Authentication](authentication.md) - Authentication configuration reference
- [HTTPS Configuration](https-configuration.md) - Secure token transmission with HTTPS
- [Reverse Proxy Testing](nginx-testing.md) - Testing with NGINX reverse proxy
