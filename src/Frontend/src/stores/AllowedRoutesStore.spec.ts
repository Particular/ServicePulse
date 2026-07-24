import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ApiRoutes } from "@/composables/apiRoutes";
import { normalizeRouteKey } from "@/composables/routeMatching";

const logger = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));

const rootFetch = vi.fn();
const scFetch = vi.fn();
const monFetch = vi.fn();
vi.mock("@/logger", () => ({
  default: logger,
}));
vi.mock("@/components/serviceControlClient", () => ({
  default: {
    fetchTypedFromServiceControl: (s: string) => rootFetch(s),
    fetchFromUrl: (u: string) => scFetch(u),
  },
}));
vi.mock("@/components/monitoring/monitoringClient", () => ({
  default: {
    get isMonitoringEnabled() {
      return true;
    },
    fetchAllowedRoutes: () => monFetch(),
  },
}));

import { useAllowedRoutesStore } from "@/stores/AllowedRoutesStore";

const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });
const MY_ROUTES_URL = "http://sc/api/my/routes";
const rootDoc = (myRoutesUrl?: string) => [{}, myRoutesUrl === undefined ? {} : { my_routes_url: myRoutesUrl }];

describe("AllowedRoutesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    logger.warn.mockReset();
    logger.error.mockReset();
    rootFetch.mockReset();
    scFetch.mockReset();
    monFetch.mockReset();
    rootFetch.mockResolvedValue(rootDoc(MY_ROUTES_URL));
  });

  it("merges Primary and Monitoring manifests into normalized keys", async () => {
    scFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "POST", url_template: "/api/errors/{id}/retry" }] }));
    monFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "DELETE", url_template: "/api/monitored-instance/{n}/{i}" }] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(scFetch).toHaveBeenCalledWith(MY_ROUTES_URL);
    expect(store.routes.has("POST /api/errors/{}/retry")).toBe(true);
    expect(store.routes.has("DELETE /api/monitored-instance/{}/{}")).toBe(true);
    expect(store.loaded).toBe(true);
  });

  it("merges and deduplicates roles from Primary and Monitoring", async () => {
    scFetch.mockResolvedValue(ok({ roles: ["admin", "support"], routes: [] }));
    monFetch.mockResolvedValue(ok({ roles: ["support"], routes: [] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.roles.sort()).toEqual(["admin", "support"]);
  });

  it("fails open per instance: a 404 from one instance contributes nothing but does not throw", async () => {
    scFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "GET", url_template: "/api/errors" }] }));
    monFetch.mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({}) });
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.routes.has("GET /api/errors")).toBe(true);
    expect(store.loadAttempted).toBe(true);
  });

  it("treats a body without a routes array as a failed instance: loaded stays false when both return malformed bodies", async () => {
    scFetch.mockResolvedValue(ok({}));
    monFetch.mockResolvedValue(ok(null));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.loaded).toBe(false);
    expect(store.loadAttempted).toBe(true);
  });

  it("fails open globally: loaded is false when both instances fail with network errors", async () => {
    scFetch.mockRejectedValue(new Error("network error"));
    monFetch.mockRejectedValue(new Error("network error"));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.loaded).toBe(false);
    expect(store.loadAttempted).toBe(true);
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenNthCalledWith(1, "Failed to fetch allowed routes", expect.any(Error));
    expect(logger.warn).toHaveBeenNthCalledWith(2, "Failed to fetch allowed routes", expect.any(Error));
  });

  it("Monitoring manifest entry at root (no /api prefix) matches the ApiRoutes registry path", async () => {
    // The Monitoring instance serves monitored-endpoints at root — no /api prefix.
    // This test pins the cross-repo path contract: the manifest entry the Monitoring
    // instance returns must round-trip through normalizeRouteKey to produce the same
    // key as the registry uses for viewMonitoredEndpoints.
    scFetch.mockResolvedValue(ok({ roles: [], routes: [] }));
    monFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "GET", url_template: "/monitored-endpoints" }] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    const expectedKey = normalizeRouteKey(ApiRoutes.viewMonitoredEndpoints.method, ApiRoutes.viewMonitoredEndpoints.path);
    expect(expectedKey).toBe("GET /monitored-endpoints");
    expect(store.routes.has(expectedKey)).toBe(true);
  });

  it("skips a malformed entry instead of aborting the load and failing gates open", async () => {
    // Regression: an entry without a template once threw inside the merge, leaving the store
    // unloaded so every gate failed OPEN. A bad entry must be skipped and the rest still load.
    scFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "GET", url_template: "/api/errors" }, { method: "POST" }] }));
    monFetch.mockResolvedValue(ok({ roles: [], routes: [] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.loaded).toBe(true);
    expect(store.routes.has("GET /api/errors")).toBe(true);
    expect(store.routes.size).toBe(1);
    expect(logger.warn).toHaveBeenCalledWith("Skipping malformed allowed-route entry", { method: "POST" });
  });

  it("skips the primary fetch entirely when the root document omits my_routes_url", async () => {
    rootFetch.mockResolvedValue(rootDoc());
    monFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "GET", url_template: "/monitored-endpoints" }] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(scFetch).not.toHaveBeenCalled();
    expect(store.routes.has("GET /monitored-endpoints")).toBe(true);
    expect(store.loaded).toBe(true);
  });

  it("skips the primary fetch and fails open when the root document request itself rejects", async () => {
    rootFetch.mockRejectedValue(new Error("network error"));
    monFetch.mockResolvedValue(ok({ roles: [], routes: [{ method: "GET", url_template: "/monitored-endpoints" }] }));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(scFetch).not.toHaveBeenCalled();
    expect(store.routes.has("GET /monitored-endpoints")).toBe(true);
    expect(store.loaded).toBe(true);
  });
});
