import { defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";

export const useEndpointConnectionStore = defineStore("EndpointConnectionStore", () => {
  const loading = ref(true);
  const queryErrors = ref<string[]>([]);
  const jsonSnippet = ref("");
  const inlineSnippet = ref("");
  const jsonConfig = ref("");

  const hasErrors = computed(() => queryErrors.value.length > 0);

  async function getCode() {
    try {
      loading.value = true;
      queryErrors.value = [];

      const [serviceControlSettings, monitoringSettings, errors] = await fetchConnectionSettings();

      if (errors.length > 0) {
        queryErrors.value = errors;
        return;
      }

      const snippets = generateSnippets(serviceControlSettings, monitoringSettings);

      jsonSnippet.value = snippets.jsonSnippet;
      inlineSnippet.value = snippets.inlineSnippet;
      jsonConfig.value = snippets.jsonConfig;
    } catch (error) {
      queryErrors.value = error instanceof Error ? [error.message] : ["Failed to load endpoint configuration"];
    } finally {
      loading.value = false;
    }
  }

  async function fetchConnectionSettings(): Promise<[Record<string, unknown>, Record<string, unknown>, string[]]> {
    const errors: string[] = [];

    // Fetch ServiceControl connection settings
    const serviceControlConnection = await serviceControlClient.getServiceControlConnection();
    if (serviceControlConnection?.errors?.length) {
      errors.push(...serviceControlConnection.errors);
    }

    // Fetch Monitoring connection settings
    const monitoringConnection = await monitoringClient.getMonitoringConnection();
    if (monitoringConnection?.errors?.length) {
      errors.push(...monitoringConnection.errors);
    }

    const serviceControlSettings = serviceControlConnection?.settings ?? {};
    const monitoringSettings = monitoringConnection?.Metrics ?? {};

    return [serviceControlSettings, monitoringSettings, errors];
  }

  function generateSnippets(serviceControlSettings: Record<string, unknown>, monitoringSettings: Record<string, unknown>) {
    const inlineSnippetTemplate = `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"{json}");

endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);`;

    const jsonSnippetTemplate = `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);`;

    const config = {
      Heartbeats: serviceControlSettings.Heartbeats,
      CustomChecks: serviceControlSettings.CustomChecks,
      ErrorQueue: serviceControlSettings.ErrorQueue,
      SagaAudit: serviceControlSettings.SagaAudit,
      MessageAudit: serviceControlSettings.MessageAudit,
      Metrics: monitoringSettings,
    };

    const jsonText = JSON.stringify(config, null, 4);
    const inlineSnippet = inlineSnippetTemplate.replace("{json}", jsonText);

    return {
      jsonSnippet: jsonSnippetTemplate,
      inlineSnippet: inlineSnippet,
      jsonConfig: jsonText,
    };
  }

  return {
    loading,
    queryErrors,
    jsonSnippet,
    inlineSnippet,
    jsonConfig,
    hasErrors,
    getCode,
  };
});
