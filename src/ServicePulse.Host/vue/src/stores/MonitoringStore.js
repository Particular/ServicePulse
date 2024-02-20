import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";

export const useMonitoringStore = defineStore("MonitoringStore", () => {
  const historyPeriodStore = useMonitoringHistoryPeriodStore();

  function getPropertyValue(obj, path) {
    const properties = path.split(".");
    return properties.reduce((accumulator, current) => accumulator[current], obj);
  }

  const route = useRoute();
  const router = useRouter();

  //STORE STATE CONSTANTS
  const grouping = ref({
    groupedEndpoints: [],
    groupSegments: 0,
    selectedGrouping: 0,
  });

  const endpointList = ref([]);
  const disconnectedEndpointCount = ref(0);
  const negativeCriticalTimeIsPresent = ref(false);
  const filterString = ref("");
  const sortBy = ref("name");
  const isSortAscending = ref(false);
  const isInitialized = ref(false);
  const endpointListCount = computed(() => endpointList.value.length);
  const endpointListIsEmpty = computed(() => endpointListCount.value === 0);
  const endpointListIsGrouped = computed(() => grouping.value.selectedGrouping !== 0);
  const getEndpointList = computed(() => (filterString.value !== "" ? MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(endpointList.value, filterString.value) : endpointList.value));

  //STORE ACTIONS
  async function initializeStore() {
    await updateFilterString();
    await updateEndpointList();
    isInitialized.value = true;
  }

  async function updateFilterString(filter = "") {
    filterString.value = filter ?? route.query.filter ?? "";

    if (filterString.value === "") {
      // eslint-disable-next-line
      const { filter, ...withoutFilter } = route.query;
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

  function updateSelectedGrouping(groupSize) {
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
    let comparator;

    if (sortByProperty === "name") {
      comparator = (a, b) => {
        return isSortAscending.value ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      };
    } else {
      comparator = (a, b) => {
        const propertyA = getPropertyValue(a, `metrics.${sortByProperty}.average`);
        const propertyB = getPropertyValue(b, `metrics.${sortByProperty}.average`);

        return isSortAscending.value ? propertyA - propertyB : propertyB - propertyA;
      };
    }

    endpointList.value.sort(comparator);
  }

  function sortGroupedEndpointList() {
    const sortByProperty = sortBy.value;
    let comparator;
    const endpointShortNameComparator = (a, b) => {
      return isSortAscending.value ? a.shortName.localeCompare(b.shortName) : b.shortName.localeCompare(a.shortName);
    };

    if (sortByProperty === "name") {
      comparator = (a, b) => {
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
