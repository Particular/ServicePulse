import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { Endpoint, EndpointStatus } from "@/resources/Heartbeat";
import moment from "moment";

export enum DisplayType {
  Instances = "Endpoint Instances",
  Logical = "Logical Endpoints",
}

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

export const useHeartbeatsStore = defineStore("HeartbeatsStore", () => {
  const selectedDisplay = ref(DisplayType.Instances);
  const endpoints = ref<Endpoint[]>([]);
  const sorted = computed<Endpoint[]>(() => (selectedDisplay.value === DisplayType.Instances ? [...endpoints.value] : mapEndpointsToLogical(endpoints.value)).sort((e1: Endpoint, e2: Endpoint) => e1.name.localeCompare(e2.name)));
  const activeEndpoints = computed<Endpoint[]>(() => sorted.value.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive));
  const inactiveEndpoints = computed<Endpoint[]>(() => sorted.value.filter((endpoint) => endpoint.monitor_heartbeat && (!endpoint.heartbeat_information || endpoint.heartbeat_information.reported_status !== EndpointStatus.Alive)));
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
        return `${endpoint.name} (${endpoint.aliveCount} instance(${endpoint.aliveCount > 1 ? "s" : ""})`;
      }

      return `${endpoint.name} (0 out of ${endpoint.downCount} previous instance${endpoint.downCount > 1 ? "s" : ""} reporting)`;
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
