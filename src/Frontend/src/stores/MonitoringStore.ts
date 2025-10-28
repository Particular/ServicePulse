import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";
import type { EndpointGroup, Endpoint, GroupedEndpoint } from "@/resources/MonitoringEndpoint";
import type { SortInfo } from "@/components/SortInfo";
import useConnectionsAndStatsAutoRefresh from "@/composables/useConnectionsAndStatsAutoRefresh";
import GroupOperation from "@/resources/GroupOperation";
import { getParameter, getParams } from "./environment";
import { useServiceControlStore } from "./ServiceControlStore";

export const useMonitoringStore = defineStore("MonitoringStore", () => {
  const historyPeriodStore = useMonitoringHistoryPeriodStore();

  const route = useRoute();
  const router = useRouter();
  const { store: connectionStore } = useConnectionsAndStatsAutoRefresh();
  //TODO: if/when a recoverabilityStore is created, replace this
  const serviceControlStore = useServiceControlStore();

  //STORE STATE CONSTANTS
  const monitoringUrl = ref<string | null>();
  const grouping = ref({
    groupedEndpoints: [] as EndpointGroup[],
    groupSegments: 0,
    selectedGrouping: 0,
  });

  const sortBy = ref<SortInfo>({
    property: "name",
    isAscending: true,
  });

  const endpointList = ref<Endpoint[]>([]);
  const disconnectedEndpointCount = ref(0);
  const filterString = ref("");
  const endpointListCount = computed<number>(() => endpointList.value.length);
  const endpointListIsEmpty = computed<boolean>(() => endpointListCount.value === 0);
  const endpointListIsGrouped = computed<boolean>(() => grouping.value.selectedGrouping !== 0);
  const getEndpointList = computed<Endpoint[]>(() => (filterString.value ? endpointList.value.filter((endpoint) => endpoint.name.toLowerCase().includes(filterString.value.toLowerCase())) : endpointList.value));

  const isMonitoringDisabled = computed(() => monitoringUrl.value == null || monitoringUrl.value === "" || monitoringUrl.value === "!");
  const isMonitoringEnabled = computed(() => !isMonitoringDisabled.value);

  watch(sortBy, async () => await updateEndpointList(), { deep: true });
  watch(filterString, async (newValue) => {
    await updateFilterString(newValue);
  });

  //STORE ACTIONS
  function getMonitoringUrl() {
    if (!monitoringUrl.value) refresh();
    return monitoringUrl.value;
  }

  function refresh() {
    const params = getParams();
    const mu = getParameter(params, "mu");

    if (mu) {
      monitoringUrl.value = mu.value;
      window.localStorage.setItem("mu", monitoringUrl.value);
      console.debug(`Monitoring Url found in QS and stored in local storage: ${monitoringUrl.value}`);
    } else if (window.localStorage.getItem("mu")) {
      monitoringUrl.value = window.localStorage.getItem("mu");
      console.debug(`Monitoring Url, not in QS, found in local storage: ${monitoringUrl.value}`);
    } else if (window.defaultConfig && window.defaultConfig.monitoring_urls && window.defaultConfig.monitoring_urls.length) {
      monitoringUrl.value = window.defaultConfig.monitoring_urls[0];
      console.debug(`setting Monitoring Url to its default value: ${window.defaultConfig.monitoring_urls[0]}`);
    } else {
      console.warn("Monitoring Url is not defined.");
    }
  }

  async function updateFilterString(filter: string | null = null) {
    filterString.value = filter ?? route.query.filter?.toString() ?? "";

    if (filterString.value === "") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { filter, ...withoutFilter } = route.query;
      await router.replace({ query: withoutFilter }); // Update or add filter query parameter to url
    } else {
      await router.replace({ query: { ...route.query, filter: filterString.value } }); // Update or add filter query parameter to url
    }
    updateGroupedEndpoints();
  }

  async function updateEndpointList() {
    if (connectionStore.monitoringConnectionState.unableToConnect) {
      endpointList.value = [];
    } else {
      endpointList.value = await getAllMonitoredEndpoints();
    }
    if (!endpointListIsEmpty.value) {
      updateGroupSegments();
      if (endpointListIsGrouped.value) {
        updateGroupedEndpoints();
      } else {
        sortEndpointList();
      }
    }
  }

  async function getAllMonitoredEndpoints() {
    let endpoints: Endpoint[] = [];
    if (isMonitoringEnabled.value) {
      try {
        const [, data] = await fetchTypedFromMonitoring<Endpoint[]>(`monitored-endpoints?history=${historyPeriodStore.historyPeriod.pVal}`);
        endpoints = data ?? [];
        const [, exceptionGroups] = await serviceControlStore.fetchTypedFromServiceControl<GroupOperation[]>(`recoverability/groups/Endpoint Name`);

        //Squash and add to existing monitored endpoints
        if (exceptionGroups.length > 0) {
          //sort the exceptionGroups array by name - case sensitive
          exceptionGroups.sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0)); //desc
          exceptionGroups
            .filter((exceptionGroup) => exceptionGroup.operation_status !== "ArchiveCompleted")
            .forEach((exceptionGroup) => {
              const monitoredEndpoint = endpoints.find((item) => item.name === exceptionGroup.title);
              if (monitoredEndpoint) {
                monitoredEndpoint.serviceControlId = exceptionGroup.id;
                monitoredEndpoint.errorCount = exceptionGroup.count;
              }
            });
        }
      } catch (error) {
        console.error(error);
      }
    }
    return endpoints;
  }

  function updateSelectedGrouping(groupSize: number) {
    grouping.value.selectedGrouping = groupSize;
    if (groupSize === 0) {
      sortEndpointList();
    } else {
      updateGroupedEndpoints();
    }
  }

  function updateGroupSegments() {
    grouping.value.groupSegments = endpointList.value.reduce((acc, cur) => Math.max(acc, cur.name.split(".").length - 1), 0);
  }

  function updateGroupedEndpoints() {
    const groups = new Map<string, EndpointGroup>();
    for (const element of getEndpointList.value) {
      const newGrouping = parseEndpoint(element, grouping.value.selectedGrouping);

      const resultGroup = groups.get(newGrouping.groupName) ?? {
        group: newGrouping.groupName,
        endpoints: [],
      };
      resultGroup.endpoints.push(newGrouping);
      groups.set(newGrouping.groupName, resultGroup);
    }

    grouping.value.groupedEndpoints = [...groups.values()];
    sortGroupedEndpointList();
  }

  function parseEndpoint(endpoint: Endpoint, maxGroupSegments: number) {
    if (maxGroupSegments === 0) {
      return {
        groupName: "Ungrouped",
        shortName: endpoint.name,
        endpoint: endpoint,
      };
    }

    const segments = endpoint.name.split(".");
    const groupSegments = segments.slice(0, maxGroupSegments);
    const endpointSegments = segments.slice(maxGroupSegments);
    if (endpointSegments.length === 0) {
      // the endpoint's name is shorter than the group size
      return parseEndpoint(endpoint, maxGroupSegments - 1);
    }

    return {
      groupName: groupSegments.join("."),
      shortName: endpointSegments.join("."),
      endpoint,
    } as GroupedEndpoint;
  }

  function sortEndpointList() {
    const comparator = (() => {
      if (sortBy.value.property === "name") {
        return (a: Endpoint, b: Endpoint) => (sortBy.value.isAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
      } else {
        return (a: Endpoint, b: Endpoint) => {
          const propertyA = a.metrics[sortBy.value.property].average;
          const propertyB = b.metrics[sortBy.value.property].average;

          return sortBy.value.isAscending ? propertyA - propertyB : propertyB - propertyA;
        };
      }
    })();

    endpointList.value.sort(comparator);
  }

  function sortGroupedEndpointList() {
    let comparator;
    const endpointShortNameComparator = (a: GroupedEndpoint, b: GroupedEndpoint) => {
      return sortBy.value.isAscending ? a.shortName.localeCompare(b.shortName) : b.shortName.localeCompare(a.shortName);
    };

    if (sortBy.value.property === "name") {
      comparator = (a: EndpointGroup, b: EndpointGroup) => {
        const groupNameA = a.group;
        const groupNameB = b.group;
        const endpointListGroupA = a.endpoints;
        const endpointListGroupB = b.endpoints;

        // Sort each group's endpoints before sorting the group name
        endpointListGroupA.sort(endpointShortNameComparator);
        endpointListGroupB.sort(endpointShortNameComparator);

        return sortBy.value.isAscending ? groupNameA.localeCompare(groupNameB) : groupNameB.localeCompare(groupNameA);
      };
    }
    // TODO: Determine how sorting should be handled for columns other than endpoint name

    if (grouping.value.groupedEndpoints.length > 1) {
      grouping.value.groupedEndpoints.sort(comparator);
    } else if (grouping.value.groupedEndpoints.length === 1) {
      grouping.value.groupedEndpoints[0].endpoints.sort(endpointShortNameComparator);
    }
  }

  async function fetchTypedFromMonitoring<T>(suffix: string): Promise<[Response?, T?]> {
    if (!monitoringUrl.value) refresh();

    if (isMonitoringDisabled.value) {
      return [];
    }

    const response = await fetch(`${getMonitoringUrl()}${suffix}`);
    const data = await response.json();

    return [response, data];
  }

  async function deleteFromMonitoring(suffix: string) {
    const requestOptions = {
      method: "DELETE",
    };
    return await fetch(`${getMonitoringUrl()}${suffix}`, requestOptions);
  }

  async function optionsFromMonitoring() {
    if (isMonitoringDisabled.value) {
      return Promise.resolve(null);
    }

    const requestOptions = {
      method: "OPTIONS",
    };
    return await fetch(getMonitoringUrl() ?? "", requestOptions);
  }

  return {
    //state
    monitoringUrl,
    grouping,
    endpointList,
    disconnectedEndpointCount,
    filterString,
    sortBy,

    //getters
    isMonitoringDisabled,
    isMonitoringEnabled,
    endpointListCount,
    endpointListIsEmpty,
    endpointListIsGrouped,
    getEndpointList,

    //actions
    refresh,
    updateSelectedGrouping,
    updateEndpointList,
    updateFilterString,
    fetchTypedFromMonitoring,
    deleteFromMonitoring,
    optionsFromMonitoring,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMonitoringStore, import.meta.hot));
}

export type MonitoringStore = ReturnType<typeof useMonitoringStore>;
