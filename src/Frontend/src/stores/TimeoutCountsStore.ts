import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import type { SagaTimeoutCounts } from "@/resources/SagaTimeout";

export const useTimeoutCountsStore = defineStore("TimeoutCountsStore", () => {
  const pendingCount = ref(0);
  const overdueCount = ref(0);

  async function refresh() {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<SagaTimeoutCounts>("timeouts/counts");
      pendingCount.value = data.pending ?? 0;
      overdueCount.value = data.overdue ?? 0;
    } catch {
      // ServiceControl versions without timeout management return 404; show no badge.
      pendingCount.value = 0;
      overdueCount.value = 0;
    }
  }

  return { pendingCount, overdueCount, refresh };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTimeoutCountsStore, import.meta.hot));
}

export type TimeoutCountsStore = ReturnType<typeof useTimeoutCountsStore>;
