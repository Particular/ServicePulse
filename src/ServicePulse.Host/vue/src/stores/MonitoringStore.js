import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { useRoute, useRouter } from "vue-router";
import messageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { useFailedMessageStore } from "./FailedMessageStore";

const cookies = useCookies().cookies;

const allPeriods = [
  { pVal: 1, text: "1m", refreshIntervalVal: 1 * 1000, refreshIntervalText: "Show data from the last minute. Refreshes every 1 second" },
  { pVal: 5, text: "5m", refreshIntervalVal: 5 * 1000, refreshIntervalText: "Show data from the last 5 minutes. Refreshes every 5 seconds" },
  { pVal: 10, text: "10m", refreshIntervalVal: 10 * 1000, refreshIntervalText: "Show data from the last 10 minutes. Refreshes every 10 seconds" },
  { pVal: 15, text: "15m", refreshIntervalVal: 15 * 1000, refreshIntervalText: "Show data from the last 15 minutes. Refreshes every 15 seconds" },
  { pVal: 30, text: "30m", refreshIntervalVal: 30 * 1000, refreshIntervalText: "Show data from the last 30 minutes. Refreshes every 30 seconds" },
  { pVal: 60, text: "1h", refreshIntervalVal: 60 * 1000, refreshIntervalText: "Show data from the last hour. Refreshes every 1 minute" },
];

function getHistoryPeriod(route = null, requestedPeriod = null) {
  const period = requestedPeriod ?? (route?.query?.historyPeriod || cookies.get("history_period"));

  return allPeriods.find((index) => index.pVal === parseInt(period)) ?? allPeriods[0];
}

const getMemoisedEndpointDetails = memoiseOne(MonitoringEndpoints.useGetEndpointDetails);

export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return {
      grouping: {
        groupedEndpoints: [],
        groupSegments: 0,
        selectedGrouping: 0,
      },
      allPeriods,
      endpointList: [],
      endpointDetails: {},
      messageTypes: {},
      messageTypesAvailable: false,
      messageTypesUpdatedSet: [],
      disconnectedEndpointCount: 0,
      filterString: "",
      historyPeriod: getHistoryPeriod(),
      sortBy: "name",
      isSortAscending: false,
      isInitialized: false,
      route: useRoute(),
      router: useRouter(),
    };
  },
  actions: {
    async initializeStore() {
      await this.setHistoryPeriod();
      await this.updateFilterString();
      await this.updateEndpointList();
      this.isInitialized = true;
    },
    async updateFilterString(filter = null) {
      this.filterString = filter ?? this.route.query.filter ?? "";
      if (this.filterString === "") {
        // eslint-disable-next-line
        const { filter, ...withoutFilter } = this.route.query;
        await this.router.replace({ query: withoutFilter }); // Update or add filter query parameter to url
      } else {
        await this.router.replace({ query: { ...this.route.query, filter: this.filterString } }); // Update or add filter query parameter to url
      }
      await this.updateEndpointList();
      this.updateGroupedEndpoints();
    },
    async updateEndpointList() {
      this.endpointList = await MonitoringEndpoints.useGetAllMonitoredEndpoints(this.historyPeriod.pVal);
      if (!this.endpointListIsEmpty) {
        this.sortEndpointList();
        this.updateGroupSegments();
        if (this.endpointListIsGrouped) {
          this.updateGroupedEndpoints();
        }
      }
    },
    updateSelectedGrouping(groupSize) {
      this.grouping.selectedGrouping = groupSize;
      this.updateGroupedEndpoints();
    },
    updateGroupSegments() {
      this.grouping.groupSegments = MonitoringEndpoints.useFindEndpointSegments(this.endpointList);
    },
    updateGroupedEndpoints() {
      this.grouping.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(this.getEndpointList, this.grouping.selectedGrouping);
    },
    async getEndpointDetails(endpointName, historyPeriod) {
      const failedMessageStore = useFailedMessageStore();
      const { data, refresh } = getMemoisedEndpointDetails(endpointName, historyPeriod);
      await refresh();

      if (data.value.error) {
        if (this.endpointDetails && this.endpointDetails.instances) {
          this.endpointDetails.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
        }
        this.endpointDetails.isScMonitoringDisconnected = true;
      } else {
        this.endpointDetails.isScMonitoringDisconnected = false;

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

        if (this.endpointDetails?.id === data.value.id && this.endpointDetails?.messageTypes?.length > 0 && this.endpointDetails?.messageTypes?.length !== data.value.messageTypes.length) {
          mergeIn(this.endpointDetails, data.value, ["messageTypes"]);

          this.messageTypesAvailable = true;
          this.messageTypesUpdatedSet = data.value.messageTypes;
        } else {
          mergeIn(this.endpointDetails, data.value);
        }

        this.endpointDetails.instances.sort((a, b) => a.id - b.id);
        this.messageTypes = new messageTypes(this.endpointDetails.messageTypes);
      }
    },
    updateMessageTypes() {
      if (this.messageTypesAvailable) {
        this.messageTypesAvailable = false;
        this.endpointDetails.messageTypes = this.messageTypesUpdatedSet;
        this.messageTypesUpdatedSet = [];
        this.messageTypes = new messageTypes(this.messageTypes.messageTypes);
      }
    },
    async getDisconnectedEndpointCount() {
      this.disconnectedEndpointCount = await MonitoringEndpoints.useGetDisconnectedEndpointCount();
    },
    /**
     * @param {String} period - The history period value
     * @description Sets the history period based on, in order of importance, a passed parameter, the url query string, saved cookie, or default value
     */
    async setHistoryPeriod(requestedPeriod = null) {
      const period = getHistoryPeriod(this.route, requestedPeriod);

      if (period) {
        this.historyPeriod = period;
        cookies.set("history_period", this.historyPeriod.pVal);
        await this.router.replace({ query: { ...this.route.query, historyPeriod: this.historyPeriod.pVal } });
      }
    },
    async updateSort(sortBy = "name", isSortAscending = false) {
      this.sortBy = sortBy;
      this.isSortAscending = isSortAscending;
      await this.updateEndpointList();
    },
    sortEndpointList() {
      const sortByProperty = this.sortBy;
      let comparator;

      if (sortByProperty === "name") {
        comparator = (a, b) => {
          return this.isSortAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        };
      } else {
        comparator = (a, b) => {
          const propertyA = getPropertyValue(a, `metrics.${sortByProperty}.average`);
          const propertyB = getPropertyValue(b, `metrics.${sortByProperty}.average`);

          return this.isSortAscending ? propertyA - propertyB : propertyB - propertyA;
        };
      }

      this.endpointList.sort(comparator);
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    endpointListIsEmpty: (state) => state.endpointListCount === 0,
    endpointListIsGrouped: (state) => state.grouping.selectedGrouping !== 0,
    getEndpointList: (state) => {
      return state.filterString !== "" ? MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(state.endpointList, state.filterString) : state.endpointList;
    },
  },
});

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
