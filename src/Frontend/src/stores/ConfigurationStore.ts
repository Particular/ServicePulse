import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import type Configuration from "@/resources/Configuration";
import serviceControlClient from "@/components/serviceControlClient";
import logger from "@/logger";

export const useConfigurationStore = defineStore("ConfigurationStore", () => {
  const configuration = ref<Configuration | null>(null);
  let refreshPromise: Promise<void> | null = null;

  const isMassTransitConnected = computed(() => configuration.value?.mass_transit_connector !== undefined);

  async function refresh() {
    refreshPromise ??= (async () => {
      try {
        const response = await serviceControlClient.fetchFromServiceControl("configuration");
        configuration.value = await response.json();
      } catch (error) {
        logger.error("Failed to fetch configuration:", error);
      } finally {
        refreshPromise = null;
      }
    })();

    await refreshPromise;
  }

  async function ensureLoaded() {
    if (configuration.value !== null) {
      return;
    }
    await refresh();
  }

  return {
    configuration,
    isMassTransitConnected,
    ensureLoaded,
    refresh,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigurationStore, import.meta.hot));
}

export type ConfigurationStore = ReturnType<typeof useConfigurationStore>;
