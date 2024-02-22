import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";
import type { EndpointGroup, Endpoint, GroupedEndpoint } from "@/resources/Endpoint";

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

  async function updateFilterString(filter = null) {
    filterString.value = filter ?? route.query.filter?.toString() ?? "";

    if (filterString.value === "") {
      const { filter: _, ...withoutFilter } = route.query;
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
      updateGroupSegments();
      endpointListIsGrouped.value ? updateGroupedEndpoints() : sortEndpointList();
    }
  }

  function updateSelectedGrouping(groupSize: number) {
    grouping.value.selectedGrouping = groupSize;
    groupSize === 0 ? sortEndpointList() : updateGroupedEndpoints();
  }

  function updateGroupSegments() {
    grouping.value.groupSegments = MonitoringEndpoints.useFindEndpointSegments(endpointList.value);
  }

  function updateGroupedEndpoints() {
    grouping.value.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(getEndpointList.value, grouping.value.selectedGrouping);
    sortGroupedEndpointList();
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

  function sortGroupedEndpointList() {
    const sortByProperty = sortBy.value;
    let comparator;
    const endpointShortNameComparator = (a: GroupedEndpoint, b: GroupedEndpoint) => {
      return isSortAscending.value ? a.shortName.localeCompare(b.shortName) : b.shortName.localeCompare(a.shortName);
    };

    if (sortByProperty === "name") {
      comparator = (a: EndpointGroup, b: EndpointGroup) => {
        const groupNameA = a.group;
        const groupNameB = b.group;
        const endpointListGroupA = a.endpoints;
        const endpointListGroupB = b.endpoints;

        // Sort each group's endpoints before sorting the group name
        endpointListGroupA.sort(endpointShortNameComparator);
        endpointListGroupB.sort(endpointShortNameComparator);

        return isSortAscending.value ? groupNameA.localeCompare(groupNameB) : groupNameB.localeCompare(groupNameA);
      };
    }
    // TODO: Determine how sorting should be handled for columns other than endpoint name

    if (grouping.value.groupedEndpoints.length > 1) {
      grouping.value.groupedEndpoints.sort(comparator);
    } else if (grouping.value.groupedEndpoints.length === 1) {
      grouping.value.groupedEndpoints[0].endpoints.sort(endpointShortNameComparator);
    }
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
