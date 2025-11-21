import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import Configuration from "@/resources/Configuration";
import serviceControlClient from "@/components/serviceControlClient";

export const useConfigurationStore = defineStore("ConfigurationStore", () => {
  const configuration = ref<Configuration | null>(null);

  const isMassTransitConnected = computed(() => configuration.value?.mass_transit_connector !== undefined);

  async function refresh() {
    if (!serviceControlClient.url) return;

    const response = await serviceControlClient.fetchFromServiceControl("configuration");
    configuration.value = await response.json();
  }

  return {
    configuration,
    refresh,
    isMassTransitConnected,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigurationStore, import.meta.hot));
}

export type ConfigurationStore = ReturnType<typeof useConfigurationStore>;
