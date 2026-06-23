import { computed } from "vue";
import { storeToRefs } from "pinia";
import { usePermissionsStore } from "@/stores/PermissionsStore";
import { useAuthStore } from "@/stores/AuthStore";

// Permission-aware composable. Consumers (button v-ifs, nav filters) are UX-only: they
// hide what the user cannot do. ServiceControl remains the real authority; the descriptor
// the store holds is a cache of the effective permission set the server would enforce.
//
// Gating is fail-open: it only kicks in once authorization is enabled, the user is
// authenticated and the descriptor has loaded. Otherwise everything is shown, so the UI
// is unchanged for auth-disabled and older-ServiceControl deployments.
export function usePermissions() {
  const store = usePermissionsStore();
  const { authEnabled, isAuthenticated } = storeToRefs(useAuthStore());

  const shouldGate = computed(() => authEnabled.value && isAuthenticated.value && store.loaded);

  // Whether gating decisions can be made: true when there is nothing to gate (auth off or
  // user not authenticated) or once a fetch has settled. Consumers use this to hold UI until
  // permissions are known (gate-on-ready), so items don't appear and then disappear.
  const ready = computed(() => !(authEnabled.value && isAuthenticated.value) || store.loadAttempted);

  // Fetch (or join an in-flight fetch of) the current user's permissions.
  function fetchDescriptor(): Promise<void> {
    return store.refresh();
  }

  // Whether the current user holds `permission` (e.g. "error:messages:retry").
  // Fail-open until gating applies.
  function can(permission: string): boolean {
    return !shouldGate.value || store.permissions.has(permission);
  }

  // Whether the user holds ANY of the given permissions. Handy for showing a parent nav
  // item when the user can reach at least one child.
  function canAny(permissions: string[]): boolean {
    return permissions.some((permission) => can(permission));
  }

  return { fetchDescriptor, can, canAny, shouldGate, ready };
}
