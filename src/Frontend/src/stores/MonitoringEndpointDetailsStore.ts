import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";
import MessageTypes from "@/components/monitoring/messageTypes";
import * as MonitoringEndpoints from "@/composables/serviceMonitoringEndpoints";
import memoiseOne from "memoize-one";
import { formatGraphDuration } from "../components/monitoring/formatGraph";
import { type ExtendedEndpointDetails, type ExtendedEndpointInstance, type MessageType, type EndpointDetails, type EndpointDetailsError, isError } from "@/resources/MonitoringEndpoint";
import { useMonitoringHistoryPeriodStore } from "./MonitoringHistoryPeriodStore";
import { useGetExceptionGroupsForEndpoint } from "../composables/serviceMessageGroup";
import type GroupOperation from "@/resources/GroupOperation";
import { emptyEndpointDetails } from "@/components/monitoring/endpoints";

async function getFailureDetails(classifier: string, classifierFilter: string) {
  const failedMessages: GroupOperation[] = await useGetExceptionGroupsForEndpoint(classifier, classifierFilter);
  const groupOperation: GroupOperation | undefined = failedMessages[0];
  return {
    serviceControlId: groupOperation?.id ?? "",
    errorCount: groupOperation?.count ?? 0,
  };
}

export const useMonitoringEndpointDetailsStore = defineStore("MonitoringEndpointDetailsStore", () => {
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
          const { serviceControlId, errorCount } = await getFailureDetails("Endpoint Instance", instance.id);
          return { ...instance, serviceControlId, errorCount, isScMonitoringDisconnected: false };
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
    const { serviceControlId, errorCount } = await getFailureDetails("Endpoint Name", endpointName.value);
    endpointDetails.value.serviceControlId = serviceControlId;
    endpointDetails.value.errorCount = errorCount;
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
