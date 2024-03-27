import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import CustomCheck from "@/resources/CustomCheck";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";

export const useCustomChecksStore = defineStore("CustomChecksStore", () => {
  const REFRESH_EVERY = 5000;
  let refreshInterval: number | null = null;

  const pageNumber = ref(1);
  const failingCount = ref(0);

  const failedChecks = ref<CustomCheck[]>([]);

  watch(pageNumber, () => loadData());

  async function loadData() {
    try {
      if (refreshInterval != null) {
        window.clearTimeout(refreshInterval);
      }
      const [response, data] = await useTypedFetchFromServiceControl<CustomCheck[]>(`customchecks?status=fail&page=${pageNumber.value}`);
      if (response.ok) {
        failedChecks.value = data;
        failingCount.value = parseInt(response.headers.get("Total-Count") ?? "0");
      }
    } finally {
      refreshInterval = window.setTimeout(() => loadData(), REFRESH_EVERY);
    }
  }

  loadData();

  return {
    pageNumber,
    failingCount,
    failedChecks,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomChecksStore, import.meta.hot));
}

export type MonitoringHistoryPeriodStore = ReturnType<typeof useCustomChecksStore>;
