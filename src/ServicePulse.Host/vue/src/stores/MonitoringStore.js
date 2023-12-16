import { defineStore } from "pinia";
import { useGetAllMonitoredEndpoints } from "../composables/serviceMonitoringEndpoints";

export const useMonitoringStore = defineStore("MonitoringStore", {
  state: () => {
    return { endpointList: [] };
  },
  actions: {
    async updateEndpointList(historyPeriod) {
      this.endpointList = await useGetAllMonitoredEndpoints(historyPeriod);
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
  },
});
