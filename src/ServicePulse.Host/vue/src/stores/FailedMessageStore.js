import { defineStore } from "pinia";
import { useGetExceptionGroupsForEndpoint } from "../composables/serviceMessageGroup.js";

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
    serviceControlId: (state) => state.failedMessagesList[0].id,
    errorCount: (state) => state.failedMessagesList[0]!=null?state.failedMessagesList[0].count:0,
    isFailedMessagesEmpty: (state) => state.errorCount === 0,
  },
});
