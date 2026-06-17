import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";

interface PermissionsSummary {
  failed_messages_read: boolean;
  failed_messages_write: boolean;
  auditing_read: boolean;
  monitoring_read: boolean;
  monitoring_write: boolean;
  admin_read: boolean;
  admin_write: boolean;
}

interface PermissionsDescriptor {
  user: string;
  permissions: string[];
}

export const useUserPermissionsStore = defineStore("UserPermissionsStore", () => {
  const summary = ref<PermissionsSummary | null>(null);
  const descriptor = ref<PermissionsDescriptor | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const [summaryResult, descriptorResult] = await Promise.all([
        serviceControlClient.fetchTypedFromServiceControl<PermissionsSummary>("my/permissions"),
        serviceControlClient.fetchTypedFromServiceControl<PermissionsDescriptor>("my/permissions/all"),
      ]);
      summary.value = summaryResult[1];
      descriptor.value = descriptorResult[1];
    } catch {
      error.value = "Failed to load user permissions";
    } finally {
      loading.value = false;
    }
  }

  return { summary, descriptor, loading, error, refresh };
});

export type { PermissionsSummary, PermissionsDescriptor };

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserPermissionsStore, import.meta.hot));
}
