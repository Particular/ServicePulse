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

  function fetchManifest(): Promise<void> {
    return store.refresh();
  }

  // resource: reserved for future resource-level scope (ignored today). See design Future-proofing.
  function canCall(entry: RouteRef, _resource?: object): boolean {
    return !shouldGate.value || store.routes.has(normalizeRouteKey(entry.method, entry.path));
  }

  function canAnyCall(entries: RouteRef[]): boolean {
    return entries.some((e) => canCall(e));
  }

  return { fetchManifest, canCall, canAnyCall, shouldGate, ready };
}
