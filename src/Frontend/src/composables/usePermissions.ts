import { computed } from "vue";
import { storeToRefs } from "pinia";
import { usePermissionsStore } from "@/stores/PermissionsStore";
import { useAuthStore } from "@/stores/AuthStore";
import serviceControlClient from "@/components/serviceControlClient";
import logger from "@/logger";

// Module-singleton in-flight guard so concurrent callers (e.g. an app-level load and a
// view's onMounted) share one request instead of fetching the descriptor twice.
let inFlight: Promise<void> | null = null;

// Permission-aware composable. Consumers (button v-ifs, nav filters) are UX-only: they
// hide what the user cannot do. ServiceControl remains the real authority; the descriptor
// this reads is a cache of the effective permission set the server would enforce.
//
// Gating is fail-open: it only kicks in once authorization is enabled, the user is
// authenticated and the descriptor has loaded. Otherwise everything is shown, so the UI
// is unchanged for auth-disabled and older-ServiceControl deployments.
export function usePermissions() {
  const store = usePermissionsStore();
  const { authEnabled, isAuthenticated } = storeToRefs(useAuthStore());

  const shouldGate = computed(() => authEnabled.value && isAuthenticated.value && store.loaded);

  async function load(): Promise<void> {
    try {
      const response = await serviceControlClient.fetchFromServiceControl("my/permissions/all");

      // Leave any existing descriptor intact on failure (fail-safe — don't widen or drop
      // the user's permissions because of a transient error or a 401), and log it.
      if (!response.ok) {
        logger.warn(`Failed to fetch permissions: ${response.status} ${response.statusText}`);
        return;
      }

      store.setDescriptor(await response.json());
    } catch (error) {
      logger.error("Error fetching permissions", error);
    }
  }

  // Fetch (or join an in-flight fetch of) the current user's permissions.
  function fetchDescriptor(): Promise<void> {
    return (inFlight ??= load().finally(() => (inFlight = null)));
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

  return { fetchDescriptor, can, canAny, shouldGate };
}
