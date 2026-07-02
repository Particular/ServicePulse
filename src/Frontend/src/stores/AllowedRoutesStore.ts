import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { normalizeRouteKey } from "@/composables/routeMatching";
import logger from "@/logger";
import type RootUrls from "@/resources/RootUrls";

export interface ManifestEntry {
  method: string;
  // Field name is inconsistent across instances: Primary serializes snake_case (url_template),
  // Monitoring serializes camelCase (urlTemplate). Both must be accepted defensively — optional
  // at the type level because wire data is validated at runtime either way.
  url_template?: string;
  urlTemplate?: string;
  [k: string]: unknown;
}

// Holds the allowed-route manifest the current token may call, merged from the instances
// ServicePulse calls directly (Primary + Monitoring). A Map (not a Set) preserves each entry so a
// future per-route `scope` field survives (resource-level checks). Keys are normalizeRouteKey().
export const useAllowedRoutesStore = defineStore("AllowedRoutesStore", () => {
  const routes = ref<Map<string, ManifestEntry>>(new Map());
  const loaded = ref(false);
  const loadAttempted = ref(false);
  // Whether the primary ServiceControl instance's root document advertised my_routes_url,
  // i.e. whether this version of ServiceControl supports reporting the allowed-route manifest.
  const supported = ref(false);

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

  // The root document only advertises my_routes_url once ServiceControl supports the
  // endpoint; older instances omit it, and the primary fetch below is skipped entirely
  // rather than requesting a path we already know doesn't exist.
  async function getMyRoutesUrl(): Promise<string | undefined> {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<RootUrls>("");
      return data.my_routes_url;
    } catch {
      return undefined;
    }
  }

  async function load() {
    try {
      const myRoutesUrl = await getMyRoutesUrl();
      supported.value = !!myRoutesUrl;
      const [primary, monitoring] = await Promise.all([
        myRoutesUrl ? fetchInstance(() => serviceControlClient.fetchFromUrl(myRoutesUrl)) : Promise.resolve(null),
        fetchInstance(() => (monitoringClient.isMonitoringEnabled ? monitoringClient.fetchAllowedRoutes() : Promise.resolve(undefined))),
      ]);
      const merged = new Map<string, ManifestEntry>();
      for (const list of [primary, monitoring]) {
        for (const entry of list ?? []) {
          // Need to support both camel as snake casing
          const urlTemplate = typeof entry.url_template === "string" ? entry.url_template
                            : typeof entry.urlTemplate === "string" ? entry.urlTemplate : undefined;
          // Skip any entry missing a method or template rather than throwing: a single malformed
          // entry must never abort the load, which would leave the store unloaded and silently
          // fail every permission gate OPEN (showing actions the user cannot perform).
          if (!entry.method || urlTemplate === undefined) {
            logger.warn("Skipping malformed allowed-route entry", entry);
            continue;
          }
          merged.set(normalizeRouteKey(entry.method, urlTemplate), entry);
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
    supported.value = false;
  }

  return { routes, loaded, loadAttempted, supported, refresh, clear };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAllowedRoutesStore, import.meta.hot));
}
