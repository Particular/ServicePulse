import { defineStore } from "pinia";
import { useGetAllMonitoredEndpoints } from "../composables/serviceMonitoringEndpoints";
import { useFetchFromMonitoring } from "../composables/serviceServiceControlUrls";

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
        this.endpointDetails = await useFetchFromMonitoring(`${`monitored-endpoints`}/${endpointName}?history=${historyPeriod}`);
    },
  },
  getters: {
    endpointListCount: (state) => state.endpointList.length,
    isEndpointListEmpty: (state) => state.endpointListCount === 0,
  },
});
