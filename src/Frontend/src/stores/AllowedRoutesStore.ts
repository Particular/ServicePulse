import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { normalizeRouteKey } from "@/composables/routeMatching";
import logger from "@/logger";

export interface ManifestEntry { method: string; urlTemplate: string; [k: string]: unknown }

// Holds the allowed-route manifest the current token may call, merged from the instances
// ServicePulse calls directly (Primary + Monitoring). A Map (not a Set) preserves each entry so a
// future per-route `scope` field survives (resource-level checks). Keys are normalizeRouteKey().
export const useAllowedRoutesStore = defineStore("AllowedRoutesStore", () => {
  const routes = ref<Map<string, ManifestEntry>>(new Map());
  const loaded = ref(false);
  const loadAttempted = ref(false);

  // Per-store in-flight guard so concurrent callers share one request. Kept on the store
  // (not module scope) so each Pinia instance — e.g. a re-mounted app — has its own, and a
  // stale request can never resolve into a different store instance.
  let inFlight: Promise<void> | null = null;

  async function fetchInstance(get: () => Promise<Response | undefined>): Promise<ManifestEntry[] | null> {
    try {
      const response = await get();
      if (!response || !response.ok) return null; // per-instance fail-open
      return (await response.json()) as ManifestEntry[];
    } catch (error) {
      logger.warn("Failed to fetch allowed routes", error);
      return null;
    }
  }

  async function load() {
    try {
      const [primary, monitoring] = await Promise.all([
        fetchInstance(() => serviceControlClient.fetchFromServiceControl("my/routes")),
        fetchInstance(() => monitoringClient.isMonitoringEnabled ? monitoringClient.fetchAllowedRoutes() : Promise.resolve(undefined)),
      ]);
      const merged = new Map<string, ManifestEntry>();
      for (const list of [primary, monitoring]) {
        for (const entry of list ?? []) {
          merged.set(normalizeRouteKey(entry.method, entry.urlTemplate), entry);
        }
      }
      routes.value = merged;
      loaded.value = primary !== null || monitoring !== null;
    } finally {
      loadAttempted.value = true;
    }
  }

  // Fetch (or join an in-flight fetch of) the current user's allowed routes.
  function refresh() {
    return (inFlight ??= load().finally(() => (inFlight = null)));
  }

  function clear() {
    routes.value = new Map();
    loaded.value = false;
    loadAttempted.value = false;
  }

  return { routes, loaded, loadAttempted, refresh, clear };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAllowedRoutesStore, import.meta.hot));
}
