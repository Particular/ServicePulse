import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { Endpoint, EndpointSettings, EndpointStatus } from "@/resources/Heartbeat";
import moment from "moment";
import SortOptions, { SortDirection } from "@/resources/SortOptions";
import getSortFunction from "@/components/getSortFunction";

function mapEndpointsToLogical(endpoints: Endpoint[], settings: EndpointSettings[]): Endpoint[] {
  const logicalNames = [...new Set(endpoints.map((endpoint) => endpoint.name))];
  const defaultTrackingInstancesValue = settings.find((value) => value.name === "")?.track_instances ?? true;

  return logicalNames.map((endpointName) => {
    const logicalInstances = endpoints.filter((endpoint) => endpoint.name === endpointName);
    const aliveList = logicalInstances.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive);

    const aliveCount = aliveList.length;
    const downCount = logicalInstances.length - aliveCount;

    return {
      name: endpointName,
      alive_count: aliveCount,
      down_count: downCount,
      track_instances: settings.find((value) => value.name === endpointName)?.track_instances ?? defaultTrackingInstancesValue,
      heartbeat_information: {
        reported_status: aliveCount > 0 ? EndpointStatus.Alive : EndpointStatus.Dead,
        last_report_at: logicalInstances.reduce((previousMax: Endpoint | null, endpoint: Endpoint) => {
          if (endpoint.heartbeat_information) {
            if (previousMax) {
              return moment.utc(endpoint.heartbeat_information.last_report_at) > moment.utc(previousMax.heartbeat_information!.last_report_at) ? endpoint : previousMax;
            }
            return endpoint;
          }
          return previousMax;
        }, null)?.heartbeat_information?.last_report_at,
      },
      monitor_heartbeat: logicalInstances.some((endpoint) => endpoint.monitor_heartbeat),
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
    selector: (group) => moment.utc(group.heartbeat_information?.last_report_at ?? "1975-01-01T00:00:00"),
    icon: "bi-sort-",
  },
];

export const useHeartbeatsStore = defineStore("HeartbeatsStore", () => {
  const selectedEndpointSort = ref<SortOptions<Endpoint>>(endpointSortOptions[0]);
  const endpointFilterString = ref("");
  const endpoints = ref<Endpoint[]>([]);
  const settings = ref<EndpointSettings[]>([]);
  const sortedEndpoints = computed<Endpoint[]>(() => mapEndpointsToLogical(endpoints.value, settings.value).sort(selectedEndpointSort.value.sort ?? getSortFunction(endpointSortOptions[0].selector, SortDirection.Ascending)));
  const activeEndpoints = computed<Endpoint[]>(() => sortedEndpoints.value.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive));
  const filteredActiveEndpoints = computed<Endpoint[]>(() => activeEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const inactiveEndpoints = computed<Endpoint[]>(() => sortedEndpoints.value.filter((endpoint) => !endpoint.heartbeat_information || endpoint.heartbeat_information.reported_status !== EndpointStatus.Alive));
  const filteredInactiveEndpoints = computed<Endpoint[]>(() => inactiveEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const failedHeartbeatsCount = computed(() => inactiveEndpoints.value.filter((value) => value.monitor_heartbeat).length);

  watch(endpointFilterString, (newValue) => {
    setEndpointFilterString(newValue);
  });

  const dataRetriever = useAutoRefresh(async () => {
    try {
      const [[, data], [, data2]] = await Promise.all([useTypedFetchFromServiceControl<Endpoint[]>("endpoints"), useTypedFetchFromServiceControl<EndpointSettings[]>("endpointssettings")]);
      endpoints.value = data;
      settings.value = data2;
    } catch (e) {
      endpoints.value = settings.value = [];
      throw e;
    }
  }, 5000);

  function endpointDisplayName(endpoint: Endpoint) {
    const total = endpoint.alive_count + endpoint.down_count;
    return `(${endpoint.alive_count}/${total} instance${total > 1 ? "s" : ""})`;
  }

  function setSelectedEndpointSort(sort: SortOptions<Endpoint>) {
    //sort value is set/retrieved from cookies in the OrderBy control
    selectedEndpointSort.value = sort;
  }

  function setEndpointFilterString(filter: string) {
    endpointFilterString.value = filter;
  }

  const refresh = dataRetriever.executeAndResetTimer;

  refresh().then();

  return {
    refresh,
    sortedEndpoints,
    endpoints,
    activeEndpoints,
    filteredActiveEndpoints,
    inactiveEndpoints,
    filteredInactiveEndpoints,
    failedHeartbeatsCount,
    endpointDisplayName,
    selectedEndpointSort,
    setSelectedEndpointSort,
    endpointFilterString,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHeartbeatsStore, import.meta.hot));
}

export type HeartbeatsStore = ReturnType<typeof useHeartbeatsStore>;
