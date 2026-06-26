import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { normalizeRouteKey } from "@/composables/routeMatching";
import logger from "@/logger";

export interface ManifestEntry {
  method: string;
  // ServiceControl pins this field to snake_case on every instance (RouteManifestEntry uses
  // [JsonPropertyName]). Optional at the type level because wire data is validated at runtime.
  url_template?: string;
  [k: string]: unknown;
}

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
      const json = await response.json();
      if (!Array.isArray(json)) return null; // guard against non-array bodies (error envelopes, etc.)
      return json as ManifestEntry[];
    } catch (error) {
      logger.warn("Failed to fetch allowed routes", error);
      return null;
    }
  }

  async function load() {
    try {
      const [primary, monitoring] = await Promise.all([
        fetchInstance(() => serviceControlClient.fetchFromServiceControl("my/routes")),
        fetchInstance(() => (monitoringClient.isMonitoringEnabled ? monitoringClient.fetchAllowedRoutes() : Promise.resolve(undefined))),
      ]);
      const merged = new Map<string, ManifestEntry>();
      for (const list of [primary, monitoring]) {
        for (const entry of list ?? []) {
          // Skip any entry missing a method or template rather than throwing: a single malformed
          // entry must never abort the load, which would leave the store unloaded and silently
          // fail every permission gate OPEN (showing actions the user cannot perform).
          if (!entry.method || typeof entry.url_template !== "string") {
            logger.warn("Skipping malformed allowed-route entry", entry);
            continue;
          }
          merged.set(normalizeRouteKey(entry.method, entry.url_template), entry);
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
