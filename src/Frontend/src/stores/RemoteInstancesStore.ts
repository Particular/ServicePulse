import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { RemoteInstance } from "@/resources/RemoteInstance";
import serviceControlClient from "@/components/serviceControlClient";

export const useRemoteInstancesStore = defineStore("RemoteInstancesStore", () => {
  const remoteInstances = ref<RemoteInstance[] | null>(null);

  async function refresh() {
    const response = await serviceControlClient.fetchFromServiceControl("configuration/remotes");
    remoteInstances.value = await response.json();
  }

  refresh();

  return {
    remoteInstances,
    refresh,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRemoteInstancesStore, import.meta.hot));
}

export type RemoteInstancesStore = ReturnType<typeof useRemoteInstancesStore>;
