import { render } from "@testing-library/vue";
import { describe, test, expect, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { ref } from "vue";

vi.mock("bootstrap", () => ({}));

// Avoid pulling in a real router; App only needs useRoute (for meta) and RouterView.
const routeMeta = ref<Record<string, unknown>>({});
vi.mock("vue-router", () => ({
  useRoute: () => ({
    get meta() {
      return routeMeta.value;
    },
  }),
  RouterView: { name: "RouterView", template: "<div data-testid='router-view' />" },
}));

import App from "@/App.vue";
import { useAuthStore } from "@/stores/AuthStore";

function setup(opts: { authEnabled: boolean; isAuthenticated: boolean; meta?: Record<string, unknown> }) {
  routeMeta.value = opts.meta ?? {};
  const pinia = createTestingPinia({ stubActions: false });
  setActivePinia(pinia);
  const store = useAuthStore();
  store.authEnabled = opts.authEnabled;
  store.isAuthenticated = opts.isAuthenticated;
  return render(App, {
    global: {
      plugins: [pinia],
      stubs: {
        PageHeader: { template: "<div data-testid='page-header' />" },
        PageFooter: true,
        LicenseNotifications: true,
        BackendChecksNotifications: true,
      },
    },
  });
}

// App.vue is now display-only: recovery from a lost session lives in useAuth (see useAuth.spec.ts).
describe("App layout gating", () => {
  test("shows the full layout when authenticated", () => {
    const { queryByTestId } = setup({ authEnabled: true, isAuthenticated: true });
    expect(queryByTestId("page-header")).not.toBeNull();
    expect(queryByTestId("router-view")).not.toBeNull();
  });

  test("shows the full layout when authentication is disabled", () => {
    const { queryByTestId } = setup({ authEnabled: false, isAuthenticated: false });
    expect(queryByTestId("page-header")).not.toBeNull();
  });

  test("renders nothing when auth is enabled and the user is not authenticated", () => {
    const { queryByTestId } = setup({ authEnabled: true, isAuthenticated: false });
    expect(queryByTestId("page-header")).toBeNull();
    expect(queryByTestId("router-view")).toBeNull();
  });

  test("on an anonymous route, shows the page without the full layout", () => {
    const { queryByTestId } = setup({ authEnabled: true, isAuthenticated: false, meta: { allowAnonymous: true } });
    expect(queryByTestId("router-view")).not.toBeNull();
    expect(queryByTestId("page-header")).toBeNull();
  });
});
