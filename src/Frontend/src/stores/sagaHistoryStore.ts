import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import { SagaHistory } from "@/resources/SagaHistory";
import { useFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";

export const useSagaHistoryStore = defineStore("sagaHistory", () => {
  const sagaHistory = ref<SagaHistory | null>(null);
  const sagaId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Watch for changes to sagaId and fetch saga history data
  watch(sagaId, async (newSagaId) => {
    if (!newSagaId) {
      sagaHistory.value = null;
      return;
    }

    await fetchSagaHistory(newSagaId);
  });

  // Action to set saga ID
  function setSagaId(id: string | null) {
    sagaId.value = id;
  }

  // Action to fetch saga history
  async function fetchSagaHistory(id: string) {
    if (!id) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await useFetchFromServiceControl(`sagas/${id}`);

      if (response.status === 404) {
        sagaHistory.value = null;
        error.value = "Saga history not found";
      } else if (!response.ok) {
        sagaHistory.value = null;
        error.value = "Failed to fetch saga history";
      } else {
        const data = await response.json();

        sagaHistory.value = data;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error occurred";
      sagaHistory.value = null;
    } finally {
      loading.value = false;
    }
  }

  // Action to clear saga history
  function clearSagaHistory() {
    sagaHistory.value = null;
    sagaId.value = null;
    error.value = null;
  }

  return {
    sagaHistory,
    sagaId,
    loading,
    error,
    setSagaId,
    fetchSagaHistory,
    clearSagaHistory,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSagaHistoryStore, import.meta.hot));
}

export type SagaHistoryStore = ReturnType<typeof useSagaHistoryStore>;
