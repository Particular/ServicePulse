import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { Endpoint, EndpointStatus } from "@/resources/Heartbeat";

export enum DisplayType {
  Instances = "Endpoint Instances",
  Logical = "Logical Endpoints",
}

export const useHeartbeatsStore = defineStore("HeartbeatsStore", () => {
  const endpoints = ref<Endpoint[]>([]);
  const sorted = computed<Endpoint[]>(() => [...endpoints.value].sort((e1: Endpoint, e2: Endpoint) => e1.name.localeCompare(e2.name)));
  const activeEndpoints = computed<Endpoint[]>(() => sorted.value.filter((endpoint) => endpoint.monitored && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive));
  const inactiveEndpoints = computed<Endpoint[]>(() => sorted.value.filter((endpoint) => endpoint.monitored && (!endpoint.heartbeat_information || endpoint.heartbeat_information.reported_status !== EndpointStatus.Alive)));
  const selectedDisplay = ref(DisplayType.Instances);
  const filterString = ref("");

  const dataRetriever = useAutoRefresh(async () => {
    try {
      const [, data] = await useTypedFetchFromServiceControl<Endpoint[]>("endpoints");
      endpoints.value = data;
    } catch (e) {
      endpoints.value = [];
      throw e;
    }
  }, 5000);

  function endpointDisplayName(endpoint: Endpoint) {
    if (selectedDisplay.value === DisplayType.Logical) {
      if (endpoint.aliveCount > 0) {
        return `${endpoint.name} (${endpoint.aliveCount} instance(${endpoint.aliveCount > 1 && "s"})`;
      }

      return `${endpoint.name} (0 out of ${endpoint.downCount} previous instance${endpoint.downCount > 1 && "s"} reporting)`;
    }

    return `${endpoint.name}@${endpoint.host_display_name}`;
  }

  function setSelectedDisplay(displayType: DisplayType) {
    selectedDisplay.value = displayType;
  }

  dataRetriever.executeAndResetTimer();

  return {
    endpoints,
    activeEndpoints,
    inactiveEndpoints,
    endpointDisplayName,
    selectedDisplay,
    setSelectedDisplay,
    filterString,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeartbeatsStore, import.meta.hot));
}

export type HeartbeatsStore = ReturnType<typeof useHeartbeatsStore>;
