import { defineStore } from "pinia";
import { useCookies } from "vue3-cookies";
import { useRoute, useRouter } from "vue-router";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";

const cookies = useCookies().cookies;
const periods = [
  { pVal: 1, text: "1m", refreshIntervalVal: 1 * 1000, refreshIntervalText: "Show data from the last minute. Refreshes every 1 second" },
  { pVal: 5, text: "5m", refreshIntervalVal: 5 * 1000, refreshIntervalText: "Show data from the last 5 minutes. Refreshes every 5 seconds" },
  { pVal: 10, text: "10m", refreshIntervalVal: 10 * 1000, refreshIntervalText: "Show data from the last 10 minutes. Refreshes every 10 seconds" },
  { pVal: 15, text: "15m", refreshIntervalVal: 15 * 1000, refreshIntervalText: "Show data from the last 15 minutes. Refreshes every 15 seconds" },
  { pVal: 30, text: "30m", refreshIntervalVal: 30 * 1000, refreshIntervalText: "Show data from the last 30 minutes. Refreshes every 30 seconds" },
  { pVal: 60, text: "1h", refreshIntervalVal: 60 * 1000, refreshIntervalText: "Show data from the last hour. Refreshes every 1 minute" },
];

export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return {
      endpointList: [],
      endpointDetails: {},
      disconnectedEndpointCount: 0,
      filteredEndpointList: [],
      isEndpointListFiltered: false,
      filterString: "",
      allPeriods: periods,
      historyPeriod: periods[0],
      noMonitoringData: false,
      isInitialized: false,
      route: useRoute(),
      router: useRouter(),
      selectedGrouping: 0,
      isEndpointListGrouped: false,
      grouping: {
        groupedEndpoints: [],
        groupSegments: 0,
        selectedGrouping: 0,
      },
    };
  },
  actions: {
    async initializeStore() {
      await this.setHistoryPeriod();
      const queryParameters = { ...this.route.query };
      if (queryParameters.filter !== undefined) {
        this.filterString = queryParameters.filter;
        this.isEndpointListFiltered = true;
        await this.filterEndpointList(this.filterString);
      }
      await this.updateEndpointList();
      this.noMonitoringData = this.isEndpointListEmpty ? true : false;
      this.isInitialized = true;
      return;
    },
    async updateEndpointList() {
      this.endpointList = await MonitoringEndpoints.useGetAllMonitoredEndpoints(this.historyPeriod.pVal);
      this.noMonitoringData = this.isEndpointListEmpty ? true : false;
      if (this.noMonitoringData) {
        return;
      }
      this.updateGroupSegments();
      if (this.isEndpointListGrouped) {
        this.updateGroupedEndpoints();
      }
    },
    async filterEndpointList(filterString) {
      this.filterString = filterString;
      let queryParameters = { ...this.route.query };

      if (filterString === "") {
        this.isEndpointListFiltered = false;
        delete queryParameters.filter;
        await this.router.push({ query: { ...queryParameters } });
        await this.updateEndpointList();
        return;
      }

      await this.router.push({ query: { ...queryParameters, filter: filterString } }); // Update or add filter query parameter to url
      await this.updateEndpointList();

      if (this.noMonitoringData) {
        return;
      }

      this.filteredEndpointList = await MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(this.endpointList, filterString);
      this.isEndpointListFiltered = true;

      if (this.isEndpointListGrouped) {
        this.updateGroupedEndpoints();
      }
    },
    updateSelectedGrouping(groupSize) {
      this.grouping.selectedGrouping = groupSize;
      this.isEndpointListGrouped = groupSize === 0 ? false : true;
      this.updateGroupedEndpoints();
    },
    updateGroupSegments() {
      this.grouping.groupSegments = MonitoringEndpoints.useFindEndpointSegments(this.endpointList);
    },
    updateGroupedEndpoints() {
      if (this.isEndpointListFiltered) {
        this.grouping.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(this.filteredEndpointList, this.grouping.selectedGrouping);
      } else {
        this.grouping.groupedEndpoints = MonitoringEndpoints.useGroupEndpoints(this.endpointList, this.grouping.selectedGrouping);
      }
    },
    async getEndpointDetails(endpointName, historyPeriod) {
      this.endpointDetails = await MonitoringEndpoints.useGetEndpointDetails(endpointName, historyPeriod);
    },
    async getDisconnectedEndpointCount() {
      this.disconnectedEndpointCount = await MonitoringEndpoints.useGetDisconnectedEndpointCount();
    },
    async setHistoryPeriod(period = undefined) {
      if (period === undefined) {
        period = this.route.query.historyPeriod; // Get url query string
        if (typeof period === "undefined") {
          period = cookies.get("history_period"); // Get cookie
        }
      }
      if (typeof period !== "undefined" && !isNaN(period)) {
        this.historyPeriod =
          periods[
            periods.findIndex((index) => {
              return index.pVal == period;
            })
          ];
      }
      cookies.set(`history_period`, this.historyPeriod.pVal);
      const queryParameters = { ...this.route.query };
      await this.router.push({ query: { ...queryParameters, historyPeriod: this.historyPeriod.pVal } });
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
  },
});
