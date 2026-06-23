import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import logger from "@/logger";

// The JSON shape returned by GET api/my/permissions/all (snake_case on the wire).
// Permissions is a flat list of permission strings, e.g. "error:messages:retry".
// (ServiceControl has no per-resource scopes yet; when it gains them this descriptor
// will grow a scope per entry — see the dormant permissionMatching.ts.)
export interface PermissionsDescriptor {
  user: string;
  permissions: string[];
}

// Holds the current user's effective permission set and loads it from ServiceControl.
// A Set gives O(1) membership checks for usePermissions().can().
export const usePermissionsStore = defineStore("PermissionsStore", () => {
  const user = ref("");
  const permissions = ref<Set<string>>(new Set());
  const loaded = ref(false); // a descriptor was successfully applied
  const loadAttempted = ref(false); // a fetch has settled (success OR failure)

  // Per-store in-flight guard so concurrent callers share one request. Kept on the store
  // (not module scope) so each Pinia instance — e.g. a re-mounted app — has its own, and a
  // stale request can never resolve into a different store instance.
  let inFlight: Promise<void> | null = null;

  function setDescriptor(descriptor: PermissionsDescriptor) {
    user.value = descriptor.user;
    permissions.value = new Set(descriptor.permissions);
    loaded.value = true;
  }

  async function load() {
    try {
      const response = await serviceControlClient.fetchFromServiceControl("my/permissions/all");

      // Leave any existing descriptor intact on failure (fail-safe — don't widen or drop the
      // user's permissions because of a transient error or a 401), and log it.
      if (!response.ok) {
        logger.warn(`Failed to fetch permissions: ${response.status} ${response.statusText}`);
        return;
      }

      setDescriptor(await response.json());
    } catch (error) {
      logger.error("Error fetching permissions", error);
    } finally {
      // Even on failure, mark the attempt settled so gate-on-ready can proceed; can() then
      // fails open because loaded stayed false.
      loadAttempted.value = true;
    }
  }

  // Fetch (or join an in-flight fetch of) the current user's permissions.
  function refresh() {
    return (inFlight ??= load().finally(() => (inFlight = null)));
  }

  function clear() {
    user.value = "";
    permissions.value = new Set();
    loaded.value = false;
    loadAttempted.value = false;
  }

  return { user, permissions, loaded, loadAttempted, setDescriptor, refresh, clear };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePermissionsStore, import.meta.hot));
}
