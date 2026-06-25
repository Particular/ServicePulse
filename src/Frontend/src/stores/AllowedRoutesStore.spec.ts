import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";

const scFetch = vi.fn();
const monFetch = vi.fn();
vi.mock("@/components/serviceControlClient", () => ({ default: { fetchFromServiceControl: (s: string) => scFetch(s) } }));
vi.mock("@/components/monitoring/monitoringClient", () => ({
  default: { get isMonitoringEnabled() { return true; }, fetchAllowedRoutes: () => monFetch() },
}));

import { useAllowedRoutesStore } from "@/stores/AllowedRoutesStore";

const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

describe("AllowedRoutesStore", () => {
  beforeEach(() => { setActivePinia(createPinia()); scFetch.mockReset(); monFetch.mockReset(); });

  it("merges Primary and Monitoring manifests into normalized keys", async () => {
    scFetch.mockResolvedValue(ok([{ method: "POST", urlTemplate: "/api/errors/{id}/retry" }]));
    monFetch.mockResolvedValue(ok([{ method: "DELETE", urlTemplate: "/api/monitored-instance/{n}/{i}" }]));
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.routes.has("POST /api/errors/{}/retry")).toBe(true);
    expect(store.routes.has("DELETE /api/monitored-instance/{}/{}")).toBe(true);
    expect(store.loaded).toBe(true);
  });

  it("fails open per instance: a 404 from one instance contributes nothing but does not throw", async () => {
    scFetch.mockResolvedValue(ok([{ method: "GET", urlTemplate: "/api/errors" }]));
    monFetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    const store = useAllowedRoutesStore();
    await store.refresh();
    expect(store.routes.has("GET /api/errors")).toBe(true);
    expect(store.loadAttempted).toBe(true);
  });
});
