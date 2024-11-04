import { computed } from "vue";
import { useConfiguration } from "./configuration";

export function useIsMassTransitConnected() {
  const configuration = useConfiguration();
  return computed(() => configuration.value?.connected_applications?.connected_applications?.includes("MassTransitConnector"));
}
