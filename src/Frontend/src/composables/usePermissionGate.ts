import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/AuthStore";
import { useUserPermissionsStore, type PermissionsSummary } from "@/stores/UserPermissionsStore";

// Centralises the "should this UI element be shown for the current user" decision.
// Gating only kicks in once authorization is enabled, the user is authenticated and
// the permission summary has loaded; otherwise everything is shown (fail-open) so the
// UI is unchanged for unauthenticated/older-ServiceControl setups. Server-side checks
// remain the real enforcement — this only hides UI the user cannot use anyway.
export default function usePermissionGate() {
  const { authEnabled, isAuthenticated } = storeToRefs(useAuthStore());
  const { summary } = storeToRefs(useUserPermissionsStore());

  const shouldGate = computed(() => authEnabled.value && isAuthenticated.value && summary.value !== null);

  function has(flag: keyof PermissionsSummary): boolean {
    return !shouldGate.value || summary.value?.[flag] === true;
  }

  return { has, shouldGate };
}
