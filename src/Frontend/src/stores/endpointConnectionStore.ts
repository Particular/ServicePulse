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

      const [serviceControlSettings, monitoringSettings] = await serviceControlConnections();

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

  async function serviceControlConnections(): Promise<[Record<string, unknown>, Record<string, unknown>]> {
    const [serviceControl, monitoring] = await Promise.all([serviceControlClient.serviceControlConnectionSettings(), monitoringClient.monitoring()]);

    return [serviceControl || {}, monitoring || {}];
  }

  function generateSnippets(serviceControlSettings: Record<string, unknown>, monitoringSettings: Record<string, unknown>) {
    const inlineSnippetTemplate = `var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(@"{json}");

    endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
    `;

    const jsonSnippetTemplate = `var json = File.ReadAllText("<path-to-json-file>.json");
var servicePlatformConnection = ServicePlatformConnectionConfiguration.Parse(json);
endpointConfiguration.ConnectToServicePlatform(servicePlatformConnection);
`;

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
