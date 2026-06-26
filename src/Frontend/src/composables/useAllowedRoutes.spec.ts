import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAllowedRoutesStore } from "@/stores/AllowedRoutesStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { ApiRoutes } from "@/composables/apiRoutes";

vi.mock("@/components/serviceControlClient", () => ({
  default: { fetchFromServiceControl: vi.fn(), fetchTypedFromServiceControl: vi.fn() },
}));
vi.mock("@/components/monitoring/monitoringClient", () => ({
  default: { isMonitoringEnabled: false, fetchAllowedRoutes: vi.fn() },
}));

describe("useAllowedRoutes", () => {
  beforeEach(() => setActivePinia(createPinia()));

  function arrange(enabled: boolean, authed: boolean, keys: string[]) {
    const auth = useAuthStore();
    auth.authEnabled = enabled;
    auth.isAuthenticated = authed;
    const store = useAllowedRoutesStore();
    store.routes = new Map(keys.map((k) => [k, { method: "", url_template: "" }]));
    store.loaded = keys.length > 0;
    store.loadAttempted = true;
  }

  it("allows a granted route", () => {
    arrange(true, true, ["POST /api/errors/retry"]);
    expect(useAllowedRoutes().canCall(ApiRoutes.retryMessage)).toBe(true);
  });
  it("denies an ungranted route when gating", () => {
    arrange(true, true, ["GET /api/errors"]);
    expect(useAllowedRoutes().canCall(ApiRoutes.retryMessage)).toBe(false);
  });
  it("fails open when auth disabled", () => {
    arrange(false, false, []);
    expect(useAllowedRoutes().canCall(ApiRoutes.retryMessage)).toBe(true);
  });
  it("canCall accepts and ignores a resource argument", () => {
    arrange(true, true, ["POST /api/errors/retry"]);
    expect(useAllowedRoutes().canCall(ApiRoutes.retryMessage, { queue: "billing" })).toBe(true);
  });
  it("canAnyCall is true if any entry is granted", () => {
    arrange(true, true, ["GET /api/errors"]);
    expect(useAllowedRoutes().canAnyCall([ApiRoutes.retryMessage, ApiRoutes.viewFailedMessages])).toBe(true);
  });

  it("ready is false when auth on + authenticated but loadAttempted is false, then true after loadAttempted", () => {
    const auth = useAuthStore();
    auth.authEnabled = true;
    auth.isAuthenticated = true;
    const store = useAllowedRoutesStore();
    store.routes = new Map();
    store.loaded = false;
    store.loadAttempted = false;
    expect(useAllowedRoutes().ready.value).toBe(false);
    store.loadAttempted = true;
    expect(useAllowedRoutes().ready.value).toBe(true);
  });
});
