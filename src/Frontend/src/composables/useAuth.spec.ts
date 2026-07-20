import { describe, test, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import routeLinks from "@/router/routeLinks";

// Capture the OIDC event callbacks useAuth registers, plus a spy on signinRedirect, so the tests
// can fire "token expired" / "silent renew error" and assert that recovery re-authenticates.
const signinRedirect = vi.fn().mockResolvedValue(undefined);
const captured: { expired?: () => void; renewError?: (error: unknown) => void } = {};

vi.mock("oidc-client-ts", () => ({
  UserManager: class {
    getUser = vi.fn().mockResolvedValue(null);
    signinRedirect = signinRedirect;
    signinCallback = vi.fn().mockResolvedValue(null);
    signinSilent = vi.fn().mockResolvedValue(null);
    signoutRedirect = vi.fn().mockResolvedValue(undefined);
    removeUser = vi.fn().mockResolvedValue(undefined);
    events = {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpiring: vi.fn(),
      addAccessTokenExpired: vi.fn((cb: () => void) => {
        captured.expired = cb;
      }),
      addSilentRenewError: vi.fn((cb: (error: unknown) => void) => {
        captured.renewError = cb;
      }),
    };
  },
  WebStorageStateStore: class {},
}));

const config = { authority: "https://idp" } as never;

// Fresh module state per test (useAuth keeps a module-singleton UserManager), then run the initial
// authenticate so the handlers are registered. getUser returns null, so this initial call performs
// one signinRedirect and leaves isAuthenticating true (as in the real redirect-away flow).
async function initAuth() {
  const { useAuth } = await import("@/composables/useAuth");
  const { useAuthStore } = await import("@/stores/AuthStore");
  const auth = useAuth();
  await auth.authenticate(config);
  return useAuthStore();
}

beforeEach(() => {
  vi.resetModules();
  signinRedirect.mockClear();
  captured.expired = undefined;
  captured.renewError = undefined;
  setActivePinia(createPinia());
  window.location.hash = "";
});

describe("useAuth recovers a lost session from OIDC events", () => {
  test("re-authenticates and clears the stale token when the access token expires", async () => {
    const store = await initAuth();
    store.setAuthenticating(false); // initial redirect 'returned'
    signinRedirect.mockClear();

    captured.expired!();

    expect(signinRedirect).toHaveBeenCalledTimes(1);
    expect(store.token).toBeNull();
  });

  test("re-authenticates when silent renewal errors", async () => {
    const store = await initAuth();
    store.setAuthenticating(false);
    signinRedirect.mockClear();

    captured.renewError!(new Error("silent renew failed"));

    expect(signinRedirect).toHaveBeenCalledTimes(1);
  });

  test("does not re-authenticate while an auth flow is already running", async () => {
    const store = await initAuth();
    expect(store.isAuthenticating).toBe(true); // left true by the initial redirect
    signinRedirect.mockClear();

    captured.expired!();

    expect(signinRedirect).not.toHaveBeenCalled();
  });

  test("does not re-authenticate on the logged-out route", async () => {
    const store = await initAuth();
    store.setAuthenticating(false);
    window.location.hash = `#${routeLinks.loggedOut}`;
    signinRedirect.mockClear();

    captured.expired!();

    expect(signinRedirect).not.toHaveBeenCalled();
  });
});
