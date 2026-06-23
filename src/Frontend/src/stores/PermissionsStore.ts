import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

// The JSON shape returned by GET api/my/permissions/all (snake_case on the wire).
// Permissions is a flat list of permission strings, e.g. "error:messages:retry".
// (ServiceControl has no per-resource scopes yet; when it gains them this descriptor
// will grow a scope per entry — see the dormant permissionMatching.ts.)
export interface PermissionsDescriptor {
  user: string;
  permissions: string[];
}

// Holds the current user's effective permission set. Pure state only: fetching lives
// in usePermissions. A Set gives O(1) membership checks for can().
export const usePermissionsStore = defineStore("PermissionsStore", () => {
  const user = ref("");
  const permissions = ref<Set<string>>(new Set());
  const loaded = ref(false);

  function setDescriptor(descriptor: PermissionsDescriptor) {
    user.value = descriptor.user;
    permissions.value = new Set(descriptor.permissions);
    loaded.value = true;
  }

  function clear() {
    user.value = "";
    permissions.value = new Set();
    loaded.value = false;
  }

  return { user, permissions, loaded, setDescriptor, clear };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePermissionsStore, import.meta.hot));
}
