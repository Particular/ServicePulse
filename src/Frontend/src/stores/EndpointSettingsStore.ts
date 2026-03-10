import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { EndpointSettings } from "@/resources/EndpointSettings";
import useIsEndpointSettingsSupported from "@/components/heartbeats/isEndpointSettingsSupported";

export const useEndpointSettingsStore = defineStore("EndpointSettingsStore", () => {
  const defaultEndpointSettingsValue = <EndpointSettings>{ name: "", track_instances: true };
  const isEndpointSettingsSupported = useIsEndpointSettingsSupported();

  const loading = ref(true);
  const queryErrors = ref<string[]>([]);
  const jsonSnippet = ref("");
  const inlineSnippet = ref("");
  const jsonConfig = ref("");

  const hasErrors = computed(() => queryErrors.value.length > 0);

  async function getEndpointSettings(): Promise<EndpointSettings[]> {
    if (!isEndpointSettingsSupported.value) return [defaultEndpointSettingsValue];

    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EndpointSettings[]>(`endpointssettings`);
    return data;
  }

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

    const serviceControlConnection = await serviceControlClient.getServiceControlConnection();
    if (serviceControlConnection?.errors?.length) {
      errors.push(...serviceControlConnection.errors);
    }

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
    const inlineSnippetValue = inlineSnippetTemplate.replace("{json}", jsonText);

    return {
      jsonSnippet: jsonSnippetTemplate,
      inlineSnippet: inlineSnippetValue,
      jsonConfig: jsonText,
    };
  }

  return {
    defaultEndpointSettingsValue,
    getEndpointSettings,
    loading,
    queryErrors,
    jsonSnippet,
    inlineSnippet,
    jsonConfig,
    hasErrors,
    getCode,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEndpointSettingsStore, import.meta.hot));
}

export type EndpointSettingsStore = ReturnType<typeof useEndpointSettingsStore>;
