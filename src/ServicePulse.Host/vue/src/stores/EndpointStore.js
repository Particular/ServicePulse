import { defineStore } from "pinia";
import { useGetAllMonitoredEndpoints } from "../composables/serviceMonitoringEndpoints";

export const useEndpointStore = defineStore("EndpointStore", {
  state: () => {
    return { endpointList: [] };
  },
  actions: {
    async fill(historyPeriod) {
      this.endpointList = await useGetAllMonitoredEndpoints(historyPeriod);
    },
    async updateHistoryPeriod(historyPeriod) {
      this.endpointList = await useGetAllMonitoredEndpoints(historyPeriod);
    },
  },
  getters: {
    count: (state) => state.endpointList.length,
    isEmpty: (state) => state.count === 0,
  },
});
