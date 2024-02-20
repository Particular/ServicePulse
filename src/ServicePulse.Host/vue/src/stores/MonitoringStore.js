import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { useFailedMessageStore } from "./FailedMessageStore";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";

export const useMonitoringStore = defineStore("MonitoringStore", () => {
  const failedMessageStore = useFailedMessageStore();
  const historyPeriodStore = useMonitoringHistoryPeriodStore();

  function getPropertyValue(obj, path) {
    const properties = path.split(".");
    return properties.reduce((accumulator, current) => accumulator[current], obj);
  }

  function mergeIn(destination, source, propertiesToSkip) {
    for (const propName in source) {
      if (Object.prototype.hasOwnProperty.call(source, propName)) {
        if (!propertiesToSkip || !propertiesToSkip.includes(propName)) {
          destination[propName] = source[propName];
        }
      }
    }
  }

  const getMemoisedEndpointDetails = memoiseOne(MonitoringEndpoints.useGetEndpointDetails);

  const route = useRoute();
  const router = useRouter();

  //STORE STATE CONSTANTS
  const grouping = ref({
    groupedEndpoints: [],
    groupSegments: 0,
    selectedGrouping: 0,
  });

  const endpointList = ref([]);
  const endpointName = ref("");
  const endpointDetails = ref({});
  const messageTypes = ref({});
  const messageTypesAvailable = ref(false);
  const messageTypesUpdatedSet = ref([]);
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
    //await setHistoryPeriod();
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
      sortEndpointList();
      updateGroupSegments();
      if (endpointListIsGrouped.value) {
        updateGroupedEndpoints();
      }
    }
  }

  function updateSelectedGrouping(groupSize) {
    grouping.value.selectedGrouping = groupSize;
    updateGroupedEndpoints();
  }

  function updateGroupSegments() {
    grouping.value.groupSegments = MonitoringEndpoints.useFindEndpointSegments(endpointList.value);
  }

  function updateGroupedEndpoints() {
    grouping.value.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(getEndpointList.value, grouping.value.selectedGrouping);
  }

  async function getEndpointDetails(name, historyPeriod) {
    const { data, refresh } = getMemoisedEndpointDetails(name, historyPeriod);
    await refresh();

    if (data.value.error) {
      if (endpointDetails.value && endpointDetails.value.instances) {
        endpointDetails.value.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
      }
      endpointDetails.value.isScMonitoringDisconnected = true;
    } else {
      endpointDetails.value.isScMonitoringDisconnected = false;

      await Promise.all(
        data.value.instances.map(async (instance) => {
          //get error count by instance id
          await failedMessageStore.getFailedMessagesList("Endpoint Instance", instance.id);
          if (!failedMessageStore.isFailedMessagesEmpty) {
            instance.serviceControlId = failedMessageStore.serviceControlId;
            instance.errorCount = failedMessageStore.errorCount;
            instance.isScMonitoringDisconnected = false;
          }
        })
      );

      data.value.isStale = data.value.instances.every((instance) => instance.isStale);

      if (name === endpointName.value && endpointDetails.value.messageTypes.length > 0 && endpointDetails.value.messageTypes.length !== data.value.messageTypes.length) {
        mergeIn(endpointDetails.value, data.value, ["messageTypes"]);

        messageTypesAvailable.value = true;
        messageTypesUpdatedSet.value = data.value.messageTypes;
      } else {
        mergeIn(endpointDetails.value, data.value);
      }

      endpointName.value = name;

      endpointDetails.value.instances.sort((a, b) => a.id - b.id);
      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
      negativeCriticalTimeIsPresent.value = endpointDetails.value.instances.some((instance) => parseInt(formatGraphDuration(instance.metrics.criticalTime).value) < 0);
    }

    //get error count by endpoint name
    await failedMessageStore.getFailedMessagesList("Endpoint Name", endpointName);
    if (!failedMessageStore.isFailedMessagesEmpty) {
      endpointDetails.value.serviceControlId = failedMessageStore.serviceControlId;
      endpointDetails.value.errorCount = failedMessageStore.errorCount;
    }
  }

  function updateMessageTypes() {
    if (messageTypesAvailable.value) {
      messageTypesAvailable.value = false;
      endpointDetails.value.messageTypes = messageTypesUpdatedSet;
      messageTypesUpdatedSet.value = [];
      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
    }
  }

  async function getDisconnectedEndpointCount() {
    disconnectedEndpointCount.value = await MonitoringEndpoints.useGetDisconnectedEndpointCount();
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

  return {
    //state
    grouping,
    endpointList,
    endpointName,
    endpointDetails,
    messageTypes,
    messageTypesAvailable,
    messageTypesUpdatedSet,
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
    updateMessageTypes,
    updateSort,
    getDisconnectedEndpointCount,
    getEndpointDetails,
    updateEndpointList,
    updateFilterString,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMonitoringStore, import.meta.hot));
}
