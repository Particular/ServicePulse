import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageTypes from "@/components/monitoring/messageTypes";
import { useCookies } from "vue3-cookies";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { useFailedMessageStore } from "./FailedMessageStore";

export const useMonitoringStore = defineStore("MonitoringStore", () => {
  const { cookies } = useCookies();

  const periods = [
    { pVal: 1, text: "1m", refreshIntervalVal: 1 * 1000, refreshIntervalText: "Show data from the last minute. Refreshes every 1 second" },
    { pVal: 5, text: "5m", refreshIntervalVal: 5 * 1000, refreshIntervalText: "Show data from the last 5 minutes. Refreshes every 5 seconds" },
    { pVal: 10, text: "10m", refreshIntervalVal: 10 * 1000, refreshIntervalText: "Show data from the last 10 minutes. Refreshes every 10 seconds" },
    { pVal: 15, text: "15m", refreshIntervalVal: 15 * 1000, refreshIntervalText: "Show data from the last 15 minutes. Refreshes every 15 seconds" },
    { pVal: 30, text: "30m", refreshIntervalVal: 30 * 1000, refreshIntervalText: "Show data from the last 30 minutes. Refreshes every 30 seconds" },
    { pVal: 60, text: "1h", refreshIntervalVal: 60 * 1000, refreshIntervalText: "Show data from the last hour. Refreshes every 1 minute" },
  ];

  function getHistoryPeriod(route = null, requestedPeriod = null) {
    const period = requestedPeriod ?? (route?.query?.historyPeriod || cookies.get("history_period"));

    return allPeriods.value.find((index) => index.pVal === parseInt(period)) ?? periods[0];
  }

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

  const allPeriods = ref(periods);
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
  const historyPeriod = ref(getHistoryPeriod());
  const endpointListCount = computed(() => endpointList.value.length);
  const endpointListIsEmpty = computed(() => endpointListCount.value === 0);
  const endpointListIsGrouped = computed(() => grouping.value.selectedGrouping !== 0);
  const getEndpointList = computed(() => (filterString.value !== "" ? MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(endpointList.value, filterString.value) : endpointList.value));

  //STORE ACTIONS
  async function initializeStore() {
    await setHistoryPeriod();
    await updateFilterString();
    await updateEndpointList();
    isInitialized.value = true;
  }

  async function updateFilterString(filter = "") {
    filterString.value = filter ?? route.query["filter"] ?? "";

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
    endpointList.value = await MonitoringEndpoints.useGetAllMonitoredEndpoints(historyPeriod.value.pVal);
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
    const failedMessageStore = useFailedMessageStore();
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

  /**
   * @param {String} period - The history period value
   * @description Sets the history period based on, in order of importance, a passed parameter, the url query string, saved cookie, or default value
   */
  async function setHistoryPeriod(requestedPeriod = null) {
    const period = getHistoryPeriod(route, requestedPeriod);

    if (period) {
      historyPeriod.value = period;
      cookies.set("history_period", historyPeriod.value.pVal);
      await router.replace({ query: { ...route.query, historyPeriod: historyPeriod.value.pVal } });
    }
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
    allPeriods,
    endpointList,
    endpointName,
    endpointDetails,
    messageTypes,
    messageTypesAvailable,
    messageTypesUpdatedSet,
    disconnectedEndpointCount,
    negativeCriticalTimeIsPresent,
    filterString,
    historyPeriod,
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
    setHistoryPeriod,
    updateSelectedGrouping,
    updateMessageTypes,
    updateSort,
    getDisconnectedEndpointCount,
    getEndpointDetails,
    updateEndpointList,
  };
});
