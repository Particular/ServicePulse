import type CustomCheck from "@/resources/CustomCheck";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useCounter } from "@vueuse/core";
import serviceControlClient from "@/components/serviceControlClient";
import { isBuiltInPlatformCheck } from "@/components/customchecks/builtInPlatformChecks";

export const useCustomChecksStore = defineStore("CustomChecksStore", () => {
  const prefix = "customchecks/";

  const pageNumber = ref(1);
  const rawFailingCount = ref(0);
  const rawFailedChecks = ref<CustomCheck[]>([]);
  const showPlatformCustomChecks = ref(false);

  const { count, inc, dec } = useCounter(0);
  const skipRefresh = computed(() => count.value > 0);
  const failedChecks = computed(() => (showPlatformCustomChecks.value ? rawFailedChecks.value : rawFailedChecks.value.filter((check) => !isBuiltInPlatformCheck(check))));
  const failingCount = computed(() => failedChecks.value.length);

  const refresh = async () => {
    if (skipRefresh.value) {
      return;
    }
    try {
      const [response, data] = await serviceControlClient.fetchTypedFromServiceControl<CustomCheck[]>(`customchecks?status=fail&page=${pageNumber.value}`);
      rawFailedChecks.value = data;
      rawFailingCount.value = parseInt(response.headers.get("Total-Count") ?? "0");
    } catch (e) {
      rawFailedChecks.value = [];
      rawFailingCount.value = 0;
      throw e;
    }
  };

  watch(pageNumber, () => refresh());

  function replaceFailedChecks(checks: CustomCheck[]) {
    rawFailedChecks.value = checks;
    rawFailingCount.value = checks.length;
  }

  async function dismissCustomCheck(id: string) {
    try {
      inc();
      // NOTE: If it takes more than the refresh interval for ServiceControl to delete the check it will reappear
      rawFailedChecks.value = rawFailedChecks.value.filter((x) => x.id !== id);
      rawFailingCount.value--;

      // HINT: This is required to handle the difference between ServiceControl 4 and 5
      const guid = id.toLocaleLowerCase().startsWith(prefix) ? id.substring(prefix.length) : id;
      await serviceControlClient.deleteFromServiceControl(`${prefix}${guid}`);
    } finally {
      dec();
    }
  }

  return {
    refresh,
    replaceFailedChecks,
    dismissCustomCheck,
    pageNumber,
    failingCount,
    failedChecks,
    rawFailingCount,
    rawFailedChecks,
    showPlatformCustomChecks,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCustomChecksStore, import.meta.hot));
}

export type CustomChecksStore = ReturnType<typeof useCustomChecksStore>;
