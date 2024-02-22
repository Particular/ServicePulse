import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";
import MessageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "@/composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { useFailedMessageStore } from "./FailedMessageStore";
import { type EndpointDetails, emptyEndpointMetrics, type ExtendedEndpointDetails, type ExtendedEndpointInstance, type MessageType, type EndpointInstance } from "@/resources/Endpoint";

export const useMonitoringEndpointDetailsStore = defineStore("MonitoringEndpointDetailsStore", () => {
  const failedMessageStore = useFailedMessageStore();

  const getMemoisedEndpointDetails = memoiseOne(MonitoringEndpoints.useGetEndpointDetails);

  const endpointName = ref("");
  const endpointDetails = ref<ExtendedEndpointDetails>({
    instances: [],
    metricDetails: { metrics: emptyEndpointMetrics() },
    isScMonitoringDisconnected: false,
    serviceControlId: "",
    errorCount: 0,
    isStale: false,
    messageTypes: [],
  });
  const messageTypes = ref({});
  const messageTypesAvailable = ref(false);
  const messageTypesUpdatedSet = ref<MessageType[]>([]);
  const negativeCriticalTimeIsPresent = ref(false);

  async function getEndpointDetails(name: string, historyPeriod: number) {
    const { data, refresh } = getMemoisedEndpointDetails(name, historyPeriod);
    await refresh();

    if (data.value == null) {
      endpointDetails.value.instances.forEach((item) => (item.isScMonitoringDisconnected = true));
      endpointDetails.value.isScMonitoringDisconnected = true;
    } else {
      endpointDetails.value.isScMonitoringDisconnected = false;

      const instances = await Promise.all(
        data.value.instances.map(async (instance): Promise<ExtendedEndpointInstance> => {
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

      if (name === endpointName.value && endpointDetails.value.messageTypes.length > 0 && endpointDetails.value.messageTypes.length !== data.value.messageTypes.length) {
        const { messageTypes: _, ...dataWithoutMessageTypes } = data.value;
        endpointDetails.value = { ...endpointDetails.value, ...dataWithoutMessageTypes, instances };

        messageTypesAvailable.value = true;
        messageTypesUpdatedSet.value = data.value.messageTypes;
      } else {
        endpointDetails.value = { ...endpointDetails.value, ...data.value, instances };
      }

      endpointName.value = name;

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
      endpointDetails.value.messageTypes = messageTypesUpdatedSet.value;
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

export type MonitoringEndpointDetailsStore = ReturnType<typeof useMonitoringEndpointDetailsStore>;
