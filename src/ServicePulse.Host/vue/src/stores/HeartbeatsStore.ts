import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { Endpoint, EndpointStatus } from "@/resources/Heartbeat";

export const useHeartbeatsStore = defineStore("HeartbeatsStore", () => {
  const endpoints = ref<Endpoint[]>([]);
  const activeEndpoints = computed(() => endpoints.value.filter((endpoint) => endpoint.monitored && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive));
  const inactiveEndpoints = computed(() => endpoints.value.filter((endpoint) => endpoint.monitored && endpoint.heartbeat_information.reported_status !== EndpointStatus.Alive));

  const dataRetriever = useAutoRefresh(async () => {
    try {
      const [, data] = await useTypedFetchFromServiceControl<Endpoint[]>("endpoints");
      endpoints.value = data;
    } catch (e) {
      endpoints.value = [];
      throw e;
    }
  }, 5000);

  dataRetriever.executeAndResetTimer();

  return {
    endpoints,
    activeEndpoints,
    inactiveEndpoints,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeartbeatsStore, import.meta.hot));
}

export type HeartbeatsStore = ReturnType<typeof useHeartbeatsStore>;
