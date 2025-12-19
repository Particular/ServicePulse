import { SetupFactoryOptions } from "../driver";
import * as precondition from ".";

/**
 * Authentication configuration response from ServiceControl
 * Endpoint: GET /api/authentication/configuration
 */
export interface AuthConfigResponse {
  enabled: boolean;
  client_id: string;
  authority: string;
  api_scopes: string;
  audience: string;
}

/**
 * Default disabled auth configuration
 * Used when authentication is not configured in ServiceControl
 */
export const authDisabledConfig: AuthConfigResponse = {
  enabled: false,
  client_id: "",
  authority: "",
  api_scopes: "[]",
  audience: "",
};

/**
 * Example enabled auth configuration for testing
 * Uses placeholder values - replace with real IdP config for integration tests
 */
export const authEnabledConfig: AuthConfigResponse = {
  enabled: true,
  client_id: "servicepulse-test",
  authority: "https://login.microsoftonline.com/test-tenant-id/v2.0",
  api_scopes: '["api://servicecontrol/access_as_user"]',
  audience: "api://servicecontrol",
};

/**
 * Scenario 1: Authentication Disabled (Default)
 * ServiceControl returns auth as disabled, no login required
 */
export const hasAuthenticationDisabled =
  () =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlInstanceUrl}authentication/configuration`, {
      body: authDisabledConfig,
    });
    return authDisabledConfig;
  };

/**
 * Authentication enabled with custom configuration
 * @param config - Custom auth configuration to return
 */
export const hasAuthenticationEnabled =
  (config: Partial<AuthConfigResponse> = {}) =>
  ({ driver }: SetupFactoryOptions) => {
    const fullConfig: AuthConfigResponse = {
      ...authEnabledConfig,
      ...config,
    };
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlInstanceUrl}authentication/configuration`, {
      body: fullConfig,
    });
    return fullConfig;
  };

/**
 * Authentication endpoint returns an error (ServiceControl unavailable)
 */
export const hasAuthenticationError =
  (status = 500) =>
  ({ driver }: SetupFactoryOptions) => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
    driver.mockEndpoint(`${serviceControlInstanceUrl}authentication/configuration`, {
      status,
      body: { error: "ServiceControl unavailable" },
    });
  };

/**
 * Scenario 1: Complete setup for authentication disabled
 * Includes ServiceControl with monitoring and auth disabled config
 * Use this for both manual mock scenarios and automated tests
 */
export const scenarioAuthDisabled = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasAuthenticationDisabled());
  return authDisabledConfig;
};

/**
 * Scenario 2: Complete setup for authentication enabled
 * Includes ServiceControl with monitoring and auth enabled config
 * Use this for both manual mock scenarios and automated tests
 */
export const scenarioAuthEnabled = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasAuthenticationEnabled());
  return authEnabledConfig;
};

/**
 * Mock user profile for authenticated state testing
 */
export const mockAuthenticatedUser = {
  name: "Test User",
  email: "test.user@example.com",
  sub: "user-123",
};

/**
 * Mock OIDC discovery document for browser-based testing.
 * This allows oidc-client-ts to initialize without a real IdP.
 */
export const hasOidcDiscoveryMock =
  () =>
  ({ driver }: SetupFactoryOptions) => {
    const authority = authEnabledConfig.authority;

    // Mock the OIDC discovery endpoint
    driver.mockEndpoint(`${authority}/.well-known/openid-configuration`, {
      body: {
        issuer: authority,
        authorization_endpoint: `${authority}/authorize`,
        token_endpoint: `${authority}/token`,
        userinfo_endpoint: `${authority}/userinfo`,
        end_session_endpoint: `${authority}/logout`,
        jwks_uri: `${authority}/keys`,
        response_types_supported: ["code", "id_token", "token"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
        scopes_supported: ["openid", "profile", "email", "offline_access"],
      },
    });
  };

/**
 * Creates a mock OIDC user object in the format oidc-client-ts expects.
 * This is stored in sessionStorage and retrieved by UserManager.getUser()
 */
function createOidcUserObject(token: string, profile: typeof mockAuthenticatedUser) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600; // 1 hour

  return {
    access_token: token,
    token_type: "Bearer",
    expires_at: now + expiresIn,
    expired: false,
    scope: "openid profile email offline_access",
    profile: {
      sub: profile.sub,
      name: profile.name,
      email: profile.email,
      iss: authEnabledConfig.authority,
      aud: authEnabledConfig.client_id,
      exp: now + expiresIn,
      iat: now,
    },
  };
}

/**
 * Scenario 3: Authenticated user state
 * Simulates a user who has completed the OIDC login flow.
 * Pre-populates oidc-client-ts storage with a mock authenticated user.
 *
 * Works for both browser-based manual testing and automated tests.
 */
export const scenarioAuthenticatedUser = async ({ driver }: SetupFactoryOptions) => {
  await driver.setUp(precondition.serviceControlWithMonitoring);
  await driver.setUp(hasAuthenticationEnabled());
  await driver.setUp(hasOidcDiscoveryMock());

  // Create mock token and user
  const mockToken = "mock-access-token-for-testing";
  const oidcUser = createOidcUserObject(mockToken, mockAuthenticatedUser);

  // Store in the format oidc-client-ts expects: oidc.user:{authority}:{client_id}
  const storageKey = `oidc.user:${authEnabledConfig.authority}:${authEnabledConfig.client_id}`;
  sessionStorage.setItem(storageKey, JSON.stringify(oidcUser));

  // Also set the auth_token for the AuthStore
  sessionStorage.setItem("auth_token", mockToken);

  return { authConfig: authEnabledConfig, user: mockAuthenticatedUser, token: mockToken };
};
