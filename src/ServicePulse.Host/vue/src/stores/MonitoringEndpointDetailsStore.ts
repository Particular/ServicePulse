import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";
import MessageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "@/composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { useFailedMessageStore } from "./FailedMessageStore";
import { type ExtendedEndpointDetails, type ExtendedEndpointInstance, type MessageType, emptyEndpointDetails, type EndpointDetails, type EndpointDetailsError, isError } from "@/resources/Endpoint";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";

export const useMonitoringEndpointDetailsStore = defineStore("MonitoringEndpointDetailsStore", () => {
  const failedMessageStore = useFailedMessageStore();
  const historyPeriodStore = useMonitoringHistoryPeriodStore();

  const getMemoisedEndpointDetails = memoiseOne(MonitoringEndpoints.useGetEndpointDetails);

  const endpointName = ref<string>("");
  const endpointDetails = ref<ExtendedEndpointDetails>(emptyEndpointDetails());
  const endpointError = ref<EndpointDetailsError | null>(null);
  const messageTypes = ref<MessageTypes | null>(null);
  const messageTypesAvailable = ref<boolean>(false);
  const messageTypesUpdatedSet = ref<MessageType[]>([]);
  const negativeCriticalTimeIsPresent = ref<boolean>(false);

  async function getEndpointDetails(name: string) {
    const { data, refresh } = getMemoisedEndpointDetails(name, historyPeriodStore.historyPeriod.pVal);
    await refresh();

    if (data.value == null || isError(data.value)) {
      endpointDetails.value.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
      endpointDetails.value.isScMonitoringDisconnected = true;
      endpointError.value = data.value;
    } else {
      endpointError.value = null;
      const returnedEndpointDetails = data.value as EndpointDetails;
      endpointDetails.value.isScMonitoringDisconnected = false;

      const instances = await Promise.all(
        returnedEndpointDetails.instances.map(async (instance): Promise<ExtendedEndpointInstance> => {
          //get error count by instance id
          await failedMessageStore.getFailedMessagesList("Endpoint Instance", instance.id);
          if (!failedMessageStore.isFailedMessagesEmpty) {
            return { ...instance, serviceControlId: failedMessageStore.serviceControlId, errorCount: failedMessageStore.errorCount, isScMonitoringDisconnected: false };
          }
          return { ...instance, serviceControlId: "", errorCount: 0, isScMonitoringDisconnected: false };
        })
      );
      instances.sort((a, b) => a.id.localeCompare(b.id));

      endpointDetails.value.isStale = instances.every((instance) => instance.isStale);

      if (name === endpointName.value && endpointDetails.value.messageTypes.length > 0 && endpointDetails.value.messageTypes.length !== returnedEndpointDetails.messageTypes.length) {
        const { messageTypes: returnedMessageTypes, ...dataWithoutMessageTypes } = returnedEndpointDetails;
        endpointDetails.value = { ...endpointDetails.value, ...dataWithoutMessageTypes, instances };

        messageTypesAvailable.value = true;
        messageTypesUpdatedSet.value = returnedMessageTypes;
      } else {
        endpointDetails.value = { ...endpointDetails.value, ...data.value, instances };
      }

      endpointName.value = name;

      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
      negativeCriticalTimeIsPresent.value = endpointDetails.value.instances.some((instance) => parseInt(formatGraphDuration(instance.metrics.criticalTime).value) < 0);
    }

    //get error count by endpoint name
    await failedMessageStore.getFailedMessagesList("Endpoint Name", endpointName.value);
    endpointDetails.value.serviceControlId = !failedMessageStore.isFailedMessagesEmpty ? failedMessageStore.serviceControlId : "";
    endpointDetails.value.errorCount = !failedMessageStore.isFailedMessagesEmpty ? failedMessageStore.errorCount : 0;
  }

  function updateMessageTypes() {
    if (messageTypesAvailable.value) {
      messageTypesAvailable.value = false;
      endpointDetails.value.messageTypes = messageTypesUpdatedSet.value;
      messageTypesUpdatedSet.value = [];
      messageTypes.value = new MessageTypes(endpointDetails.value.messageTypes);
    }
  }

  return {
    endpointName,
    endpointDetails,
    endpointError,
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

export type MonitoringEndpointDetailsStore = ReturnType<typeof useMonitoringEndpointDetailsStore>;
