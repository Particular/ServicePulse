import { afterEach, describe, expect, test, vi } from "vitest";
import { createApp, type App } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory, type Router } from "vue-router";
import type { SigninRedirectArgs } from "oidc-client-ts";

const { signinRedirect, signinCallback, getUser } = vi.hoisted(() => ({
  signinRedirect: vi.fn<(args?: SigninRedirectArgs) => Promise<void>>().mockResolvedValue(undefined),
  signinCallback: vi.fn(),
  getUser: vi.fn().mockResolvedValue(null),
}));

vi.mock("oidc-client-ts", () => ({
  UserManager: class {
    signinRedirect = signinRedirect;
    signinCallback = signinCallback;
    getUser = getUser;
    events = {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpiring: vi.fn(),
      addAccessTokenExpired: vi.fn(),
      addSilentRenewError: vi.fn(),
    };
  },
  WebStorageStateStore: class {},
}));

const config = { authority: "https://idp" } as never;
const emptyView = { render: () => null };
let app: App | undefined;
let router: Router | undefined;
let container: HTMLDivElement | undefined;

async function loadAuthPage(url: string) {
  app?.unmount();
  router?.options.history.destroy();
  container?.remove();
  vi.resetModules();
  window.history.replaceState(null, "", url);
  router = createRouter({
    history: createWebHashHistory(),
    routes: [
      { path: "/", redirect: "/dashboard" },
      { path: "/dashboard", component: emptyView },
      { path: "/messages/:messageId/:id", component: emptyView },
      { path: "/messages/:id", component: emptyView },
    ],
  });
  const { useAuth } = await import("./useAuth");
  let auth!: ReturnType<typeof useAuth>;
  app = createApp({
    setup() {
      auth = useAuth();
      return () => null;
    },
  });
  app.use(createPinia());
  app.use(router);
  container = document.createElement("div");
  document.body.append(container);
  app.mount(container);
  await router.isReady();
  return { auth, router };
}

afterEach(() => {
  app?.unmount();
  router?.options.history.destroy();
  container?.remove();
  app = undefined;
  router = undefined;
  container = undefined;
  vi.clearAllMocks();
  getUser.mockResolvedValue(null);
  window.history.replaceState(null, "", "/");
});

describe("useAuth preserves message deep links through OIDC login", () => {
  test("keeps the dashboard for a callback without a saved destination", async () => {
    signinCallback.mockResolvedValue({ access_token: "test-token" });
    const callback = await loadAuthPage("/?code=authorization-code&state=oidc-state");
    expect(await callback.auth.authenticate(config)).toBe(true);
    expect(callback.router.currentRoute.value.path).toBe("/dashboard");
    expect(window.location.hash).toBe("#/dashboard");
    expect(window.location.search).toBe("");
  });

  test("keeps a callback hash route when application state is absent", async () => {
    signinCallback.mockResolvedValue({ access_token: "test-token" });
    const callback = await loadAuthPage("/?code=authorization-code&state=oidc-state#/messages/message-1/processing-1?back=/messages");
    expect(await callback.auth.authenticate(config)).toBe(true);
    expect(callback.router.currentRoute.value.path).toBe("/messages/message-1/processing-1");
    expect(callback.router.currentRoute.value.query).toEqual({ back: "/messages" });
    expect(window.location.hash).toBe("#/messages/message-1/processing-1?back=/messages");
    expect(window.location.search).toBe("");
  });

  test("keeps a deep link without redirecting when a valid session exists", async () => {
    getUser.mockResolvedValue({ access_token: "test-token", expired: false });
    const page = await loadAuthPage("/#/messages/message-1/processing-1?back=/messages");
    expect(await page.auth.authenticate(config)).toBe(true);
    expect(page.router.currentRoute.value.path).toBe("/messages/message-1/processing-1");
    expect(page.router.currentRoute.value.query).toEqual({ back: "/messages" });
    expect(signinRedirect).not.toHaveBeenCalled();
    expect(signinCallback).not.toHaveBeenCalled();
  });

  test.each([
    "/messages/message-1/processing-1?back=/messages",
    "/messages/message-1/processing-1?back=%2Fmessages&search=Order%20Placed&page=2",
    "/messages/transport%2Fmessage%3D42/processing-1?back=/messages",
    "/messages/processing-1?back=/failed-messages/all-failed-messages",
  ])("returns to %s after the login callback", async (destination) => {
    const initial = await loadAuthPage(`/#${destination}`);
    const requestedRoute = initial.router.currentRoute.value;
    await initial.auth.authenticate(config);
    expect(signinRedirect).toHaveBeenCalledOnce();

    // The identity provider returns only its callback parameters. Forward the opaque
    // application state that oidc-client-ts returns with the authenticated user.
    const state = signinRedirect.mock.calls[0]?.[0]?.state;
    signinCallback.mockResolvedValue({ access_token: "test-token", state });
    const callback = await loadAuthPage("/?code=authorization-code&state=oidc-state");
    expect(callback.router.currentRoute.value.path).toBe("/dashboard");
    expect(await callback.auth.authenticate(config)).toBe(true);

    expect(callback.router.currentRoute.value.path).toBe(requestedRoute.path);
    expect(callback.router.currentRoute.value.query).toEqual(requestedRoute.query);
    expect(window.location.hash).toBe(`#${callback.router.currentRoute.value.fullPath}`);
    expect(window.location.search).toBe("");
  });
});
