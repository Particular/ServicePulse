import { defineStore } from "pinia";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import { useGetDefaultPeriod, saveSelectedPeriod } from "../composables/serviceHistoryPeriods.js";

export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return {
      endpointList: [],
      endpointDetails: {},
      disconnectedEndpointCount: 0,
      filteredEndpointList: [],
      isEndpointListFiltered: false,
      filterString: "",
      historyPeriod: useGetDefaultPeriod(),
      noData: false,
      isInitialized: false,
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
    async initializeStore(route) {
      this.historyPeriod = useGetDefaultPeriod(route);
      const queryParameters = { ...route.query };
      if (queryParameters.filter !== undefined) {
        this.filterString = queryParameters.filter;
        this.isEndpointListFiltered = true;
        await this.filterEndpointList(this.filterString);
      }
      await this.updateEndpointList();
      this.noData = this.isEndpointListEmpty ? true : false;
      this.isInitialized = true;
      return;
    },
    async updateEndpointList() {
      this.endpointList = await MonitoringEndpoints.useGetAllMonitoredEndpoints(this.historyPeriod.pVal);
      this.noData = this.isEndpointListEmpty ? true : false;
      if (this.noData) {
        return;
      }
      this.updateGroupSegments();
      if (this.isEndpointListGrouped) {
        this.updateGroupedEndpoints();
      }
    },
    async filterEndpointList(filterString) {
      this.filterString = filterString;

      if (filterString === "") {
        this.isEndpointListFiltered = false;
        await this.updateEndpointList();
        return;
      }

      await this.updateEndpointList();

      if (this.noData) {
        return;
      }

      this.filteredEndpointList = await MonitoringEndpoints.useFilterAllMonitoredEndpointsByName(this.endpointList, filterString);
      this.isEndpointListFiltered = true;

      if (this.isEndpointListGrouped) {
        this.updateGroupedEndpoints();
      }
    },
    updateHistoryPeriod(historyPeriod) {
      saveSelectedPeriod(historyPeriod);
      this.historyPeriod = historyPeriod;
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
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
    noMonitoringData: (state) => state.noData,
    isStoreInitialized: (state) => state.isInitialized,
  },
});
