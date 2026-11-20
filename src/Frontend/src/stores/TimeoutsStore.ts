import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import type { SagaTimeoutListStatus, SagaTimeoutView } from "@/resources/SagaTimeout";

export type TimeoutSortField = "due_time" | "last_changed_at" | "endpoint" | "saga_type" | "timeout_type";

export const useTimeoutsStore = defineStore("TimeoutsStore", () => {
  const status = ref<SagaTimeoutListStatus>("pending");
  const searchText = ref("");
  const endpointFilter = ref("");
  const sagaTypeFilter = ref("");
  const pageNumber = ref(1);
  const itemsPerPage = ref(50);
  const sortBy = ref<TimeoutSortField>("due_time");
  const sortDirection = ref<"asc" | "desc">("asc");

  const timeouts = ref<SagaTimeoutView[]>([]);
  const totalCount = ref(0);
  const loading = ref(true);
  const knownEndpoints = ref<string[]>([]);
  const knownSagaTypes = ref<string[]>([]);

  let requestSequence = 0;

  function buildQuery() {
    const params = new URLSearchParams({
      status: status.value,
      page: pageNumber.value.toString(),
      per_page: itemsPerPage.value.toString(),
      sort: sortBy.value,
      direction: sortDirection.value,
    });
    if (searchText.value) params.set("q", searchText.value);
    if (endpointFilter.value) params.set("endpoint", endpointFilter.value);
    if (sagaTypeFilter.value) params.set("saga_type", sagaTypeFilter.value);
    return params.toString();
  }

  function remember(target: typeof knownEndpoints, values: string[]) {
    const merged = new Set([...target.value, ...values]);
    if (merged.size !== target.value.length) {
      target.value = [...merged].sort();
    }
  }

  async function refresh() {
    const sequence = ++requestSequence;
    try {
      const [response, data] = await serviceControlClient.fetchTypedFromServiceControl<SagaTimeoutView[]>(`timeouts?${buildQuery()}`);
      if (sequence !== requestSequence) return;
      timeouts.value = data;
      totalCount.value = parseInt(response.headers.get("Total-Count") ?? `${data.length}`);
      remember(
        knownEndpoints,
        data.map((t) => t.endpoint_name)
      );
      remember(
        knownSagaTypes,
        data.map((t) => t.saga_type)
      );
    } catch (e) {
      if (sequence !== requestSequence) return;
      timeouts.value = [];
      totalCount.value = 0;
      throw e;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  function setStatus(newStatus: SagaTimeoutListStatus) {
    if (status.value === newStatus) return;
    status.value = newStatus;
    pageNumber.value = 1;
    loading.value = true;
    timeouts.value = [];
  }

  function setSort(field: TimeoutSortField) {
    if (sortBy.value === field) {
      sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = field;
      sortDirection.value = "asc";
    }
  }

  watch([searchText, endpointFilter, sagaTypeFilter], () => {
    pageNumber.value = 1;
  });
  watch([status, searchText, endpointFilter, sagaTypeFilter, pageNumber, sortBy, sortDirection], () => refresh().catch(() => {}));

  return {
    status,
    searchText,
    endpointFilter,
    sagaTypeFilter,
    pageNumber,
    itemsPerPage,
    sortBy,
    sortDirection,
    timeouts,
    totalCount,
    loading,
    knownEndpoints,
    knownSagaTypes,
    refresh,
    setStatus,
    setSort,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTimeoutsStore, import.meta.hot));
}

export type TimeoutsStore = ReturnType<typeof useTimeoutsStore>;
