import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import Configuration from "@/resources/Configuration";
import serviceControlClient from "@/components/serviceControlClient";

export const useConfigurationStore = defineStore("ConfigurationStore", () => {
  const configuration = ref<Configuration | null>(null);

  const isMassTransitConnected = computed(() => configuration.value?.mass_transit_connector !== undefined);

  serviceControlClient
    .fetchFromServiceControl("configuration")
    // eslint-disable-next-line promise/prefer-await-to-then
    .then(async (response) => {
      configuration.value = await response.json();
      return configuration.value;
    })
    // eslint-disable-next-line promise/prefer-await-to-then
    .catch((error) => {
      console.error("Failed to fetch configuration:", error);
    });

  return {
    configuration,
    isMassTransitConnected,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigurationStore, import.meta.hot));
}

export type ConfigurationStore = ReturnType<typeof useConfigurationStore>;
