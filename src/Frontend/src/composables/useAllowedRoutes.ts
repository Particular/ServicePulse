import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAllowedRoutesStore } from "@/stores/AllowedRoutesStore";
import { useAuthStore } from "@/stores/AuthStore";
import { normalizeRouteKey } from "@/composables/routeMatching";
import type { RouteRef } from "@/composables/apiRoutes";

// Route-aware gating composable (the primitive). The resource-owning view-model calls canCall and
// exposes the result; templates bind. Gating is fail-open: only applies once authorization is enabled,
// the user is authenticated and the manifest has loaded — otherwise everything is shown.
export function useAllowedRoutes() {
  const store = useAllowedRoutesStore();
  const { authEnabled, isAuthenticated } = storeToRefs(useAuthStore());

  const shouldGate = computed(() => authEnabled.value && isAuthenticated.value && store.loaded);
  const ready = computed(() => !(authEnabled.value && isAuthenticated.value) || store.loadAttempted);
  // Whether ServiceControl advertised my_routes_url, i.e. whether this version supports
  // reporting the allowed-route manifest at all (independent of whether it loaded successfully).
  const supported = computed(() => store.supported);
  // The current user's role claims, as reported by the my/routes manifest.
  const roles = computed(() => store.roles);

  function fetchManifest(): Promise<void> {
    return store.refresh();
  }

  // A call made before the manifest finishes loading races fetchManifest() and fails open
  // (shouldGate is false until store.loaded flips), letting the request through regardless of
  // permission. canCallAsync awaits this before checking; no-ops once the manifest load has been
  // attempted (or doesn't apply).
  async function ensureManifestLoaded(): Promise<void> {
    if (!ready.value) {
      await fetchManifest();
    }
  }

  // Reactive/template use (v-if, computed): synchronous, fails open until the manifest has loaded.
  // Use this for display gating, where a fail-open flash while the manifest loads is acceptable.
  // resource: reserved for future resource-level scope (ignored today). See design Future-proofing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function canCall(entry: RouteRef, _resource?: object): boolean {
    return !shouldGate.value || store.routes.has(normalizeRouteKey(entry.method, entry.path));
  }

  // One-off gate before a network call: awaits the manifest load first, so the check reflects the
  // real permission rather than the fail-open default. Callers should await this instead of
  // separately awaiting ensureManifestLoaded() then calling canCall().
  async function canCallAsync(entry: RouteRef, resource?: object): Promise<boolean> {
    await ensureManifestLoaded();
    return canCall(entry, resource);
  }

  function canAnyCall(entries: RouteRef[]): boolean {
    return entries.some((e) => canCall(e));
  }

  return { fetchManifest, ensureManifestLoaded, canCall, canCallAsync, canAnyCall, shouldGate, ready, supported, roles };
}
