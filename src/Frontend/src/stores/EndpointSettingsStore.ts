import { acceptHMRUpdate, defineStore } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { EndpointSettings } from "@/resources/EndpointSettings";
import useIsEndpointSettingsSupported from "@/components/heartbeats/isEndpointSettingsSupported";

export const useEndpointSettingsStore = defineStore("EndpointSettingsStore", () => {
  const defaultEndpointSettingsValue = <EndpointSettings>{ name: "", track_instances: true };

  const isEndpointSettingsSupported = useIsEndpointSettingsSupported();

  async function getEndpointSettings(): Promise<EndpointSettings[]> {
    if (!isEndpointSettingsSupported.value) return [defaultEndpointSettingsValue];

    const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EndpointSettings[]>(`endpointssettings`);
    return data;
  }

  return {
    defaultEndpointSettingsValue,
    getEndpointSettings,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEndpointSettingsStore, import.meta.hot));
}

export type EndpointSettingsStore = ReturnType<typeof useEndpointSettingsStore>;
