import { defineStore } from "pinia";
import { useGetAllMonitoredEndpoints, useGetEndpointDetails } from "../composables/serviceMonitoringEndpoints";


export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return {
      endpointList: [],
      endpointDetails: {},
    };
  },
  actions: {
    async updateEndpointList(historyPeriod) {
          this.endpointList = await useGetAllMonitoredEndpoints(historyPeriod);
    },
    async getEndpointDetails(endpointName, historyPeriod) {
        this.endpointDetails = await useGetEndpointDetails(endpointName, historyPeriod);
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
  },
});
