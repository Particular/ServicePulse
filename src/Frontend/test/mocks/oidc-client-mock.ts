/**
 * Mock for oidc-client-ts library
 *
 * This mock allows testing the full authentication flow without
 * requiring a real identity provider or browser redirects.
 *
 * Usage in test file (must be at the top, before other imports):
 *
 * ```typescript
 * import { vi } from "vitest";
 * import { createOidcMock } from "../../mocks/oidc-client-mock";
 *
 * vi.mock("oidc-client-ts", () => createOidcMock());
 *
 * // ... rest of imports and tests
 * ```
 */
import { vi } from "vitest";

export interface MockUser {
  access_token: string;
  expired: boolean;
  profile: {
    name: string;
    email: string;
    sub: string;
  };
}

export const defaultMockUser: MockUser = {
  access_token: "mock-access-token-for-testing",
  expired: false,
  profile: {
    name: "Test User",
    email: "test.user@example.com",
    sub: "user-123",
  },
};

/**
 * Creates the oidc-client-ts mock module with an authenticated user.
 * Use with vi.mock("oidc-client-ts", () => createOidcMock())
 *
 * @param user - The mock user to return from getUser(), or null for unauthenticated
 */
export function createOidcMock(user: MockUser | null = defaultMockUser) {
  return {
    UserManager: class MockUserManager {
      getUser = vi.fn().mockResolvedValue(user);
      signinRedirect = vi.fn().mockResolvedValue(undefined);
      signinCallback = vi.fn().mockResolvedValue(user);
      signinSilent = vi.fn().mockResolvedValue(user);
      signoutRedirect = vi.fn().mockResolvedValue(undefined);
      removeUser = vi.fn().mockResolvedValue(undefined);
      events = {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
      };
    },
    WebStorageStateStore: class MockWebStorageStateStore {},
  };
}

/**
 * Creates a mock for unauthenticated state (will trigger login redirect)
 */
export function createOidcMockUnauthenticated() {
  return createOidcMock(null);
}

/**
 * Creates a mock where signinSilent fails (simulates IdP session expired).
 * Initial authentication works, but token renewal fails.
 */
export function createOidcMockWithFailingSilentRenew(user: MockUser = defaultMockUser) {
  return {
    UserManager: class MockUserManager {
      getUser = vi.fn().mockResolvedValue(user);
      signinRedirect = vi.fn().mockResolvedValue(undefined);
      signinCallback = vi.fn().mockResolvedValue(user);
      // signinSilent fails - simulating IdP session expired
      signinSilent = vi.fn().mockRejectedValue(new Error("Silent renewal failed: IdP session expired"));
      signoutRedirect = vi.fn().mockResolvedValue(undefined);
      removeUser = vi.fn().mockResolvedValue(undefined);
      events = {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
      };
    },
    WebStorageStateStore: class MockWebStorageStateStore {},
  };
}

/**
 * Creates a mock where signinCallback fails (simulates invalid redirect URI).
 * This happens when the identity provider rejects the OAuth callback.
 */
export function createOidcMockWithInvalidRedirectUri() {
  return {
    UserManager: class MockUserManager {
      getUser = vi.fn().mockResolvedValue(null);
      signinRedirect = vi.fn().mockResolvedValue(undefined);
      // signinCallback fails - simulating IdP rejecting the redirect URI
      signinCallback = vi.fn().mockRejectedValue(new Error("Invalid redirect_uri: The redirect URI in the request does not match the configured redirect URIs"));
      signinSilent = vi.fn().mockRejectedValue(new Error("No user session"));
      signoutRedirect = vi.fn().mockResolvedValue(undefined);
      removeUser = vi.fn().mockResolvedValue(undefined);
      events = {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn(),
      };
    },
    WebStorageStateStore: class MockWebStorageStateStore {},
  };
}
