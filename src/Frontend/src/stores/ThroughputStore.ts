import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import ConnectionTestResults from "@/resources/ConnectionTestResults";
import throughputClient from "@/views/throughputreport/throughputClient";
import { Transport } from "@/views/throughputreport/transport";

export const useThroughputStore = defineStore("ThroughputStore", () => {
  const testResults = ref<ConnectionTestResults | null>(null);
  const refresh = () => dataRetriever.executeAndResetTimer();
  const hasErrors = computed(() => {
    if(isBrokerTransport) {
      return !testResults.value?.broker_connection_result.connection_successful;
    }

    return !(testResults.value?.audit_connection_result.connection_successful || testResults.value?.monitoring_connection_result.connection_successful);
  })
  const transport = computed(() => {
    if (testResults.value == null) {
      return Transport.None;
    }

    return testResults.value.transport as Transport;
  });
  const isBrokerTransport = computed(() => {
    switch (transport.value) {
      case Transport.None:
      case Transport.MSMQ:
      case Transport.AzureStorageQueue:
      case Transport.LearningTransport:
        return false;
      default:
        return true;
    }
  });
  const transportNameForInstructions = () => {
    switch (transport.value) {
      case Transport.AzureStorageQueue:
      case Transport.NetStandardAzureServiceBus:
        return "Azure";
      case Transport.LearningTransport:
        return "Learning Transport";
      case Transport.RabbitMQ:
        return "RabbitMQ";
      case Transport.SQLServer:
        return "Sql Server";
      case Transport.AmazonSQS:
        return "AWS";
    }
  }
  const dataRetriever = useAutoRefresh(async () => {
      testResults.value = await throughputClient.test();
  }, 60 * 60 * 1000 /* 1 hour */);

  refresh();

  return {
    testResults,
    refresh,
    transportNameForInstructions,
    isBrokerTransport,
    hasErrors,
    transport
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThroughputStore, import.meta.hot));
}

export type ThroughputStore = ReturnType<typeof useThroughputStore>;
