import { useDeleteFromServiceControl, usePatchToServiceControl, useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { Endpoint, EndpointStatus } from "@/resources/Heartbeat";
import moment from "moment";
import SortOptions, { SortDirection } from "@/resources/SortOptions";
import { getSortFunction } from "@/components/OrderBy.vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";

function mapEndpointsToLogical(endpoints: Endpoint[]) {
  const logicalNames = [...new Set(endpoints.map((endpoint) => endpoint.name))];
  return logicalNames.map((endpointName) => {
    const logicalList = endpoints.filter((endpoint) => endpoint.name === endpointName);
    const aliveList = logicalList.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive);

    var aliveCount = aliveList.length;
    var downCount = logicalList.filter((endpoint) => endpoint.monitor_heartbeat).length - aliveCount;

    return {
      name: endpointName,
      aliveCount: aliveCount,
      downCount: downCount,
      track_instances: true,
      heartbeat_information: {
        reported_status: aliveCount > 0 ? EndpointStatus.Alive : EndpointStatus.Dead,
        last_report_at: logicalList.reduce((previousMax: Endpoint | null, endpoint: Endpoint) => {
          if (endpoint.heartbeat_information) {
            if (previousMax) {
              return moment.utc(endpoint.heartbeat_information.last_report_at) > moment.utc(previousMax.heartbeat_information!.last_report_at) ? endpoint : previousMax;
            }
            return endpoint;
          }
          return previousMax;
        }, null)?.heartbeat_information?.last_report_at,
      },
      monitor_heartbeat: logicalList.some((endpoint) => endpoint.monitor_heartbeat),
    } as Endpoint;
  });
}

export const endpointSortOptions: SortOptions<Endpoint>[] = [
  {
    description: "Name",
    selector: (group) => group.name,
    icon: "bi-sort-alpha-",
  },
  {
    description: "Latest heartbeat",
    selector: (group) => group.heartbeat_information?.last_report_at ?? "",
    icon: "bi-sort-",
  },
];

export const instanceSortOptions: SortOptions<Endpoint>[] = [
  {
    description: "Name",
    selector: (group) => group.host_display_name,
    icon: "bi-sort-alpha-",
  },
  {
    description: "Latest heartbeat",
    selector: (group) => group.heartbeat_information?.last_report_at ?? "",
    icon: "bi-sort-",
  },
];

export const useHeartbeatsStore = defineStore("HeartbeatsStore", () => {
  const selectedEndpointSort = ref<SortOptions<Endpoint>>(endpointSortOptions[0]);
  const selectedInstanceSort = ref<SortOptions<Endpoint>>(endpointSortOptions[0]);
  const endpointFilterString = ref("");
  const instanceFilterString = ref("");
  const endpoints = ref<Endpoint[]>([]);
  const sortedEndpoints = computed<Endpoint[]>(() => mapEndpointsToLogical(endpoints.value).sort(selectedEndpointSort.value.sort ?? getSortFunction(endpointSortOptions[0].selector, SortDirection.Ascending)));
  const sortedInstances = computed<Endpoint[]>(() => endpoints.value.sort(selectedInstanceSort.value.sort ?? getSortFunction(endpointSortOptions[0].selector, SortDirection.Ascending)));
  const filteredInstances = computed<Endpoint[]>(() => sortedInstances.value.filter((instance) => !instanceFilterString.value || instance.host_display_name.toLocaleLowerCase().includes(instanceFilterString.value.toLocaleLowerCase())));
  const activeEndpoints = computed<Endpoint[]>(() => sortedEndpoints.value.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive));
  const filteredActiveEndpoints = computed<Endpoint[]>(() => activeEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const inactiveEndpoints = computed<Endpoint[]>(() => sortedEndpoints.value.filter((endpoint) => endpoint.monitor_heartbeat && (!endpoint.heartbeat_information || endpoint.heartbeat_information.reported_status !== EndpointStatus.Alive)));
  const filteredInactiveEndpoints = computed<Endpoint[]>(() => inactiveEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const failedHeartbeatsCount = computed(() => inactiveEndpoints.value.length);

  watch(endpointFilterString, (newValue) => {
    setEndpointFilterString(newValue);
  });
  watch(instanceFilterString, (newValue) => {
    setInstanceFilterString(newValue);
  });

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
    if (endpoint.aliveCount > 0) {
      return endpoint.track_instances ? `(${endpoint.aliveCount}/${endpoint.aliveCount + endpoint.downCount} instance${endpoint.aliveCount > 1 ? "s" : ""})` : `(${endpoint.aliveCount} instance${endpoint.aliveCount > 1 ? "s" : ""})`;
    }

    return `(${endpoint.downCount} previous instance${endpoint.downCount > 1 ? "s" : ""} reporting)`;
  }

  function setSelectedEndpointSort(sort: SortOptions<Endpoint>) {
    //sort value is set/retrieved from cookies in the OrderBy control
    selectedEndpointSort.value = sort;
  }

  function setSelectedInstanceSort(sort: SortOptions<Endpoint>) {
    //sort value is set/retrieved from cookies in the OrderBy control
    selectedEndpointSort.value = sort;
  }

  function setEndpointFilterString(filter: string) {
    endpointFilterString.value = filter;
  }

  function setInstanceFilterString(filter: string) {
    instanceFilterString.value = filter;
  }

  async function deleteEndpoint(endpoint: Endpoint) {
    async function performDelete() {
      useShowToast(TYPE.INFO, "Info", "Removing Endpoint");
      await useDeleteFromServiceControl(`endpoints/${endpoint.id}`);
      endpoints.value = endpoints.value.filter((ep) => ep.id !== endpoint.id);
      useShowToast(TYPE.SUCCESS, "Success", "Endpoint removed");
    }
    await dataRetriever.executeAndResetTimer(performDelete);
  }

  function toggleEndpointMonitor(endpoint: Endpoint) {
    usePatchToServiceControl(`endpoints/${endpoint.id}`, { monitor_heartbeat: !endpoint.monitor_heartbeat });
  }

  dataRetriever.executeAndResetTimer();

  return {
    endpoints,
    filteredInstances,
    activeEndpoints,
    filteredActiveEndpoints,
    inactiveEndpoints,
    filteredInactiveEndpoints,
    failedHeartbeatsCount,
    endpointDisplayName,
    selectedEndpointSort,
    setSelectedEndpointSort,
    selectedInstanceSort,
    setSelectedInstanceSort,
    endpointFilterString,
    setEndpointFilterString,
    instanceFilterString,
    setInstanceFilterString,
    deleteEndpoint,
    toggleEndpointMonitor,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeartbeatsStore, import.meta.hot));
}

export type HeartbeatsStore = ReturnType<typeof useHeartbeatsStore>;
