import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { ref, watch } from "vue";
import { RemoteInstance } from "@/resources/RemoteInstance";
import { useServiceControlStore } from "./ServiceControlStore";

export const useRemoteInstancesStore = defineStore("RemoteInstancesStore", () => {
  const remoteInstances = ref<RemoteInstance[] | null>(null);

  const serviceControlStore = useServiceControlStore();
  const { serviceControlUrl } = storeToRefs(serviceControlStore);

  async function refresh() {
    if (!serviceControlUrl.value) return;

    const response = await serviceControlStore.fetchFromServiceControl("configuration/remotes");
    remoteInstances.value = await response.json();
  }

  watch(serviceControlUrl, refresh, { immediate: true });

  return {
    remoteInstances,
    refresh,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRemoteInstancesStore, import.meta.hot));
}

export type RemoteInstancesStore = ReturnType<typeof useRemoteInstancesStore>;
