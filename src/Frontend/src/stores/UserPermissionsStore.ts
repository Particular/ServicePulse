import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";

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

  // Multiple callers can request a refresh in the same tick (the App-level watch
  // and the User Permissions view's onMounted). Share a single in-flight request
  // so they don't trigger duplicate fetches.
  let inFlight: Promise<void> | null = null;

  function refresh() {
    return (inFlight ??= load().finally(() => (inFlight = null)));
  }

  async function load() {
    loading.value = true;
    error.value = null;
    const { environment } = useEnvironmentAndVersionsStore();
    try {
      const [summaryResult, descriptorResult] = await Promise.all([
        serviceControlClient.fetchTypedFromUrl<PermissionsSummary>(environment.mypermissions_summary_url),
        serviceControlClient.fetchTypedFromUrl<PermissionsDescriptor>(environment.mypermissions_all_url),
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
