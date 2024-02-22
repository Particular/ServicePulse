import { defineStore } from "pinia";
import { useGetExceptionGroupsForEndpoint } from "../composables/serviceMessageGroup";

//TODO: this store doesn't work correctly. It assumes only one endpoint, whereas for the endpoint list they call this in parallel (so the store will only reflect the failed messages for the last endpoint)
export const useFailedMessageStore = defineStore("FailedMessageStore", {
  state: () => {
    return {
      failedMessagesList: [],
    };
  },
  actions: {
    async getFailedMessagesList(classifier, classiferFilter) {
      this.failedMessagesList = await useGetExceptionGroupsForEndpoint(classifier, classiferFilter);
    },
  },
  getters: {
    serviceControlId: (state) => state.failedMessagesList[0]?.id,
    errorCount: (state) => state.failedMessagesList[0]?.count,
    isFailedMessagesEmpty: (state) => (state.errorCount ?? 0) === 0,
  },
});
