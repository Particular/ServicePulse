import { defineStore } from "pinia";
import { useGetExceptionGroupsForEndpoint } from "../composables/serviceMessageGroup.js";

export const useFailedMessageStore = defineStore("FailedMessageStore", {
  state: () => {
    return {
      failedMessagesList: [],
    };
  },
  actions: {
      async getFailedMessagesList(instanceId) {
          this.failedMessagesList = await useGetExceptionGroupsForEndpoint("Endpoint Instance", instanceId);
    }
  },
  getters: {
      serviceControlId: (state) => state.failedMessagesList[0].id,
      errorCount: (state) => state.failedMessagesList[0].count,
      isFailedMessagesEmpty: (state) => state.errorCount === 0,
  },
});
