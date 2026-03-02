import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient, { MetricsConnectionDetails } from "@/components/monitoring/monitoringClient";

export interface EndpointConnectionConfig {
  Heartbeats: { [key: string]: unknown } | object;
  CustomChecks: { [key: string]: unknown } | object;
  ErrorQueue: string | object;
  SagaAudit: { [key: string]: unknown } | object;
  MessageAudit: { [key: string]: unknown } | object;
  Metrics: MetricsConnectionDetails;
}

export const useEndpointConnectionStore = defineStore("EndpointConnectionStore", () => {
  const loading = ref(true);
  const serviceControlConnection = ref<{ settings: { [key: string]: unknown }; errors: string[] } | null>(null);
  const monitoringConnection = ref<{ Metrics: MetricsConnectionDetails; errors: string[] } | null>(null);
  const queryErrors = ref<string[]>([]);

  const config = computed(() => {
    if (!serviceControlConnection.value || !monitoringConnection.value) {
      return null;
    }

    return {
      Heartbeats: serviceControlConnection.value.settings.Heartbeats || {},
      CustomChecks: serviceControlConnection.value.settings.CustomChecks || {},
      ErrorQueue: serviceControlConnection.value.settings.ErrorQueue || "",
      SagaAudit: serviceControlConnection.value.settings.SagaAudit || {},
      MessageAudit: serviceControlConnection.value.settings.MessageAudit || {},
      Metrics: monitoringConnection.value.Metrics || { Enabled: false },
    };
  });

  async function fetchEndpointConnectionData() {
    loading.value = true;
    queryErrors.value = [];

    try {
      const scConnection = await serviceControlClient.getServiceControlConnection();
      const mConnection = await monitoringClient.getMonitoringConnection();

      serviceControlConnection.value = scConnection;
      monitoringConnection.value = {
        Metrics: mConnection?.Metrics || { Enabled: false },
        errors: mConnection?.errors || [],
      };

      queryErrors.value = [];
      if (scConnection?.errors) {
        queryErrors.value.push(...scConnection.errors);
      }
      if (mConnection?.errors) {
        queryErrors.value.push(...mConnection.errors);
      }
    } catch (error) {
      console.error("Failed to fetch endpoint connection data:", error);
      queryErrors.value.push("Failed to fetch endpoint connection data");
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    serviceControlConnection,
    monitoringConnection,
    queryErrors,
    config,
    fetchEndpointConnectionData,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEndpointConnectionStore, import.meta.hot));
}

export type EndpointConnectionStore = ReturnType<typeof useEndpointConnectionStore>;
