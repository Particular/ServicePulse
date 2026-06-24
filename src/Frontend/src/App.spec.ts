import { render } from "@testing-library/vue";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { nextTick, ref } from "vue";

const authenticate = vi.fn().mockResolvedValue(false);
vi.mock("@/composables/useAuth", () => ({ useAuth: () => ({ authenticate }) }));
vi.mock("bootstrap", () => ({}));

// Avoid pulling in a real router; App only needs useRoute (for meta) and RouterView.
const routeMeta = ref<Record<string, unknown>>({});
vi.mock("vue-router", () => ({
  useRoute: () => ({
    get meta() {
      return routeMeta.value;
    },
  }),
  RouterView: { name: "RouterView", template: "<div />" },
}));

import App from "@/App.vue";
import { useAuthStore } from "@/stores/AuthStore";

function setup(meta: Record<string, unknown> = {}) {
  routeMeta.value = meta;
  const pinia = createTestingPinia({ stubActions: false });
  setActivePinia(pinia);
  const store = useAuthStore();
  store.authEnabled = true;
  store.isAuthenticated = true;
  store.isAuthenticating = false;
  store.authConfig = { authority: "https://idp" } as never;
  render(App, {
    global: {
      plugins: [pinia],
      stubs: { PageHeader: true, PageFooter: true, LicenseNotifications: true, BackendChecksNotifications: true },
    },
  });
  return store;
}

describe("App re-authenticates when the session is lost", () => {
  beforeEach(() => authenticate.mockClear());

  test("re-triggers authentication when the token is lost mid-session", async () => {
    const store = setup();
    expect(authenticate).not.toHaveBeenCalled();

    store.isAuthenticated = false; // token expired / cleared while running
    await nextTick();

    expect(authenticate).toHaveBeenCalledTimes(1);
  });

  test("does not re-authenticate while already authenticating", async () => {
    const store = setup();
    store.isAuthenticating = true;
    store.isAuthenticated = false;
    await nextTick();

    expect(authenticate).not.toHaveBeenCalled();
  });

  test("does not re-authenticate on an anonymous route (e.g. logged-out)", async () => {
    const store = setup({ allowAnonymous: true });
    store.isAuthenticated = false;
    await nextTick();

    expect(authenticate).not.toHaveBeenCalled();
  });
});
