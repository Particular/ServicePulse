import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";
import MessageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "../composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { useFailedMessageStore } from "./FailedMessageStore";

export const useMonitoringEndpointDetailsStore = defineStore("MonitoringEndpointDetailsStore", () => {
  const failedMessageStore = useFailedMessageStore();

  function mergeIn(destination, source, propertiesToSkip) {
    for (const propName in source) {
      if (Object.prototype.hasOwnProperty.call(source, propName)) {
        if (!propertiesToSkip || !propertiesToSkip.includes(propName)) {
          destination[propName] = source[propName];
        }
      }
    }
  }

  const getMemoisedEndpointDetails = memoiseOne(MonitoringEndpoints.useGetEndpointDetails);

  const endpointName = ref("");
  const endpointDetails = ref({});
  const messageTypes = ref({});
  const messageTypesAvailable = ref(false);
  const messageTypesUpdatedSet = ref([]);
  const negativeCriticalTimeIsPresent = ref(false);

  async function getEndpointDetails(name, historyPeriod) {
    const { data, refresh } = getMemoisedEndpointDetails(name, historyPeriod);
    await refresh();

    if (data.value.error) {
      if (endpointDetails.value && endpointDetails.value.instances) {
        endpointDetails.value.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
      }
      endpointDetails.value.isScMonitoringDisconnected = true;
    } else {
      endpointDetails.value.isScMonitoringDisconnected = false;

      await Promise.all(
        data.value.instances.map(async (instance) => {
          //get error count by instance id
          await failedMessageStore.getFailedMessagesList("Endpoint Instance", instance.id);
          if (!failedMessageStore.isFailedMessagesEmpty) {
            instance.serviceControlId = failedMessageStore.serviceControlId;
            instance.errorCount = failedMessageStore.errorCount;
            instance.isScMonitoringDisconnected = false;
          }
        })
      );

      data.value.isStale = data.value.instances.every((instance) => instance.isStale);

      if (name === endpointName.value && endpointDetails.value.messageTypes.length > 0 && endpointDetails.value.messageTypes.length !== data.value.messageTypes.length) {
        mergeIn(endpointDetails.value, data.value, ["messageTypes"]);

        messageTypesAvailable.value = true;
        messageTypesUpdatedSet.value = data.value.messageTypes;
      } else {
        mergeIn(endpointDetails.value, data.value);
      }

      endpointName.value = name;

      endpointDetails.value.instances.sort((a, b) => a.id - b.id);
      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
      negativeCriticalTimeIsPresent.value = endpointDetails.value.instances.some((instance) => parseInt(formatGraphDuration(instance.metrics.criticalTime).value) < 0);
    }

    //get error count by endpoint name
    await failedMessageStore.getFailedMessagesList("Endpoint Name", endpointName.value);
    if (!failedMessageStore.isFailedMessagesEmpty) {
      endpointDetails.value.serviceControlId = failedMessageStore.serviceControlId;
      endpointDetails.value.errorCount = failedMessageStore.errorCount;
    }
  }

  function updateMessageTypes() {
    if (messageTypesAvailable.value) {
      messageTypesAvailable.value = false;
      endpointDetails.value.messageTypes = messageTypesUpdatedSet;
      messageTypesUpdatedSet.value = [];
      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
    }
  }

  return {
    endpointName,
    endpointDetails,
    messageTypes,
    messageTypesAvailable,
    messageTypesUpdatedSet,
    negativeCriticalTimeIsPresent,
    updateMessageTypes,
    getEndpointDetails,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMonitoringEndpointDetailsStore, import.meta.hot));
}
