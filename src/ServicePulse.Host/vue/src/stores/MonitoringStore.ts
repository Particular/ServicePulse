import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter, type LocationQuery } from "vue-router";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";
import type { Endpoint, EndpointGroup } from "@/resources/Endpoint";

export const useMonitoringStore = defineStore("MonitoringStore", () => {
  const historyPeriodStore = useMonitoringHistoryPeriodStore();

  const route = useRoute();
  const router = useRouter();

  //STORE STATE CONSTANTS
  const grouping = ref({
    groupedEndpoints: [] as EndpointGroup[],
    groupSegments: 0,
    selectedGrouping: 0,
  });

  const endpointList = ref<Endpoint[]>([]);
  const disconnectedEndpointCount = ref(0);
  const negativeCriticalTimeIsPresent = ref(false);
  const filterString = ref("");
  const sortBy = ref("name");
  const isSortAscending = ref(false);
  const isInitialized = ref(false);
  const endpointListCount = computed<number>(() => endpointList.value.length);
  const endpointListIsEmpty = computed<boolean>(() => endpointListCount.value === 0);
  const endpointListIsGrouped = computed<boolean>(() => grouping.value.selectedGrouping !== 0);
  const getEndpointList = computed<Endpoint[]>(() => (filterString.value !== "" ? MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(endpointList.value, filterString.value) : endpointList.value));

  //STORE ACTIONS
  async function initializeStore() {
    await updateFilterString();
    await updateEndpointList();
    isInitialized.value = true;
  }

  async function updateFilterString(filter = "") {
    filterString.value = filter || route.query.filter?.toString() || "";

    if (filterString.value === "") {
      const withoutFilter = route.query as Omit<LocationQuery, "filter">;
      await router.replace({ query: withoutFilter }); // Update or add filter query parameter to url
    } else {
      await router.replace({ query: { ...route.query, filter: filterString.value } }); // Update or add filter query parameter to url
    }
    await updateEndpointList();
    updateGroupedEndpoints();
  }

  async function updateEndpointList() {
    endpointList.value = await MonitoringEndpoints.useGetAllMonitoredEndpoints(historyPeriodStore.historyPeriod.pVal);
    if (!endpointListIsEmpty.value) {
      sortEndpointList();
      updateGroupSegments();
      if (endpointListIsGrouped.value) {
        updateGroupedEndpoints();
      }
    }
  }

  function updateSelectedGrouping(groupSize: number) {
    grouping.value.selectedGrouping = groupSize;
    updateGroupedEndpoints();
  }

  function updateGroupSegments() {
    grouping.value.groupSegments = MonitoringEndpoints.useFindEndpointSegments(endpointList.value);
  }

  function updateGroupedEndpoints() {
    grouping.value.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(getEndpointList.value, grouping.value.selectedGrouping);
  }

  async function updateSort(newSortBy = "name", newIsSortAscending = false) {
    sortBy.value = newSortBy;
    isSortAscending.value = newIsSortAscending;
    await updateEndpointList();
  }

  function sortEndpointList() {
    const sortByProperty = sortBy.value;
    const comparator = (() => {
      if (sortByProperty === "name") {
        return (a: Endpoint, b: Endpoint) => (isSortAscending.value ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      } else {
        return (a: Endpoint, b: Endpoint) => {
          const propertyA = a.metrics[sortByProperty].average;
          const propertyB = b.metrics[sortByProperty].average;

          return isSortAscending.value ? propertyA - propertyB : propertyB - propertyA;
        };
      }
    })();

    endpointList.value.sort(comparator);
  }

  return {
    //state
    grouping,
    endpointList,
    disconnectedEndpointCount,
    negativeCriticalTimeIsPresent,
    filterString,
    sortBy,
    isSortAscending,
    isInitialized,

    //getters
    endpointListCount,
    endpointListIsEmpty,
    endpointListIsGrouped,
    getEndpointList,

    //actions
    initializeStore,
    updateSelectedGrouping,
    updateSort,
    updateEndpointList,
    updateFilterString,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMonitoringStore, import.meta.hot));
}

export type MonitoringStore = ReturnType<typeof useMonitoringStore>;
