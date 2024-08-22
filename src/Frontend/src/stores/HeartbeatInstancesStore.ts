import { useDeleteFromServiceControl, usePatchToServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { Endpoint } from "@/resources/Heartbeat";
import moment from "moment";
import type { SortInfo } from "@/components/SortInfo";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";

const nameProperty: keyof Endpoint = "name";

export const useHeartbeatInstancesStore = defineStore("HeartbeatInstancesStore", () => {
  const instanceFilterString = ref("");
  const store = useHeartbeatsStore();
  const { endpoints } = storeToRefs(store);
  const sortByInstances = ref<SortInfo>({
    property: nameProperty,
    isAscending: true,
  });
  const sortedInstances = computed<Endpoint[]>(() => {
    const nameSort = (a: Endpoint, b: Endpoint) => a.host_display_name.localeCompare(b.host_display_name);
    const dateSort = (a: Endpoint, b: Endpoint) => {
      const x = moment.utc(a.heartbeat_information?.last_report_at ?? "1975-01-01T00:00:00");
      const y = moment.utc(b.heartbeat_information?.last_report_at ?? "1975-01-01T00:00:00");
      if (x > y) {
        return 1;
      } else if (x < y) {
        return -1;
      }
      return 0;
    };
    const sortFunc = sortByInstances.value.property === nameProperty ? nameSort : dateSort;
    endpoints.value.sort((a, b) => (sortByInstances.value.isAscending ? sortFunc(a, b) : -sortFunc(a, b)));

    return endpoints.value;
  });

  const filteredInstances = computed<Endpoint[]>(() => sortedInstances.value.filter((instance) => !instanceFilterString.value || instance.host_display_name.toLocaleLowerCase().includes(instanceFilterString.value.toLocaleLowerCase())));

  watch(instanceFilterString, (newValue) => {
    setInstanceFilterString(newValue);
  });

  function setInstanceFilterString(filter: string) {
    instanceFilterString.value = filter;
  }

  async function deleteEndpointInstance(endpoint: Endpoint) {
    await useDeleteFromServiceControl(`endpoints/${endpoint.id}`);
    await store.refresh();
  }

  async function toggleEndpointMonitor(endpoint: Endpoint) {
    await usePatchToServiceControl(`endpoints/${endpoint.id}`, { monitor_heartbeat: !endpoint.monitor_heartbeat });
    await store.refresh();
  }

  return {
    filteredInstances,
    instanceFilterString,
    deleteEndpointInstance,
    toggleEndpointMonitor,
    sortByInstances,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeartbeatInstancesStore, import.meta.hot));
}

export type HeartbeatInstancesStore = ReturnType<typeof useHeartbeatInstancesStore>;
