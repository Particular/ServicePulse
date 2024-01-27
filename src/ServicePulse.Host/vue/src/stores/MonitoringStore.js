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
      filterString: "",
      allPeriods: periods,
      historyPeriod: periods[0],
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
      await this.updateFilterString();
      await this.updateEndpointList();
      this.isInitialized = true;
      return;
    },
    async updateFilterString(filter = null) {
      this.filterString = filter ?? this.route.query.filter ?? "";
      if (this.filterString === "") {
        delete this.route.query.filter;
      }
      await this.router.push({ query: { ...this.route.query, filter: filter } }); // Update or add filter query parameter to url
      await this.updateEndpointList();
    },
    async updateEndpointList() {
      this.endpointList = await MonitoringEndpoints.useGetAllMonitoredEndpoints(this.historyPeriod.pVal);
      if (!this.isEndpointListEmpty) {
        this.updateGroupSegments();
        if (this.isEndpointListGrouped) {
          this.updateGroupedEndpoints();
        }
      }
      return;
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
    /**
     * @param {String} period - The history period value
     * @description Sets the history period based on, in order of importance, a passed parameter, the url query string, saved cookie, or default value
     */
    async setHistoryPeriod(period = null) {
      if (period == null) {
        period = this.route.query.historyPeriod; // Get url query string
        if (period == null) {
          period = cookies.get("history_period"); // Get cookie
        }
      }
      if (period != null) {
        this.historyPeriod =
          periods[
            periods.findIndex((index) => {
              return index.pVal == period;
            })
          ];
      }
      cookies.set(`history_period`, this.historyPeriod.pVal);
      await this.router.push({ query: { ...this.route.query, historyPeriod: this.historyPeriod.pVal } });
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
    isEndpointListFiltered: (state) => state.filterString !== "",
    getFilteredEndpointList: async (state) => {
      return state.filterString !== "" ? await MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(state.endpointList, state.filterString) : state.endpointList;
    },
  },
});
