import { defineStore } from "pinia";
import { useGetAllMonitoredEndpoints, useGetEndpointDetails, useGetDisconnectedEndpointCount } from "../composables/serviceMonitoringEndpoints";


export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return {
      endpointList: [],
        endpointDetails: {},
        disconnectedEndpointCount: 0,
    };
  },
  actions: {
    async updateEndpointList(historyPeriod) {
        this.endpointList = await useGetAllMonitoredEndpoints(historyPeriod);
    },
    async getEndpointDetails(endpointName, historyPeriod) {
        this.endpointDetails = await useGetEndpointDetails(endpointName, historyPeriod);
      },
    async getDisconnectedEndpointCount() {
        this.disconnectedEndpointCount = await useGetDisconnectedEndpointCount();
      },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
  },
});
