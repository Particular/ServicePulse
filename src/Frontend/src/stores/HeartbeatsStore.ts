import { usePatchToServiceControl, useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import { EndpointSettings, EndpointStatus, LogicalEndpoint } from "@/resources/Heartbeat";
import moment from "moment";
import SortOptions, { SortDirection } from "@/resources/SortOptions";
import getSortFunction from "@/components/getSortFunction";
import { EndpointsView } from "@/resources/EndpointView";

export const endpointSortOptions: SortOptions<LogicalEndpoint>[] = [
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
  const selectedEndpointSort = ref<SortOptions<LogicalEndpoint>>(endpointSortOptions[0]);
  const defaultTrackingInstancesValue = ref(true);
  const endpointFilterString = ref("");
  const endpoints = ref<EndpointsView[]>([]);
  const settings = ref<EndpointSettings[]>([]);
  const sortedEndpoints = computed<LogicalEndpoint[]>(() => mapEndpointsToLogical(endpoints.value, settings.value).sort(selectedEndpointSort.value.sort ?? getSortFunction(endpointSortOptions[0].selector, SortDirection.Ascending)));
  const activeEndpoints = computed<LogicalEndpoint[]>(() =>
    sortedEndpoints.value.filter(function (endpoint) {
      return endpoint.heartbeat_information?.reported_status === EndpointStatus.Alive && ((endpoint.track_instances && endpoint.down_count === 0) || (!endpoint.track_instances && endpoint.alive_count > 0));
    })
  );
  const filteredActiveEndpoints = computed<LogicalEndpoint[]>(() => activeEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const inactiveEndpoints = computed<LogicalEndpoint[]>(() =>
    sortedEndpoints.value.filter(function (endpoint) {
      return endpoint.heartbeat_information?.reported_status === EndpointStatus.Dead || (endpoint.track_instances && endpoint.down_count > 0) || (!endpoint.track_instances && endpoint.alive_count === 0);
    })
  );
  const filteredInactiveEndpoints = computed<LogicalEndpoint[]>(() => inactiveEndpoints.value.filter((endpoint) => !endpointFilterString.value || endpoint.name.toLowerCase().includes(endpointFilterString.value.toLowerCase())));
  const failedHeartbeatsCount = computed(() => inactiveEndpoints.value.filter((value) => value.monitor_heartbeat).length + activeEndpoints.value.filter((endpoint) => endpoint.track_instances && endpoint.down_count > 0).length);

  watch(endpointFilterString, (newValue) => {
    setEndpointFilterString(newValue);
  });

  const dataRetriever = useAutoRefresh(async () => {
    try {
      const [[, data], [, data2]] = await Promise.all([useTypedFetchFromServiceControl<EndpointsView[]>("endpoints"), useTypedFetchFromServiceControl<EndpointSettings[]>("endpointssettings")]);
      endpoints.value = data;
      settings.value = data2;
      defaultTrackingInstancesValue.value = data2.find((value) => value.name === "")?.track_instances ?? true;
    } catch (e) {
      endpoints.value = settings.value = [];
      throw e;
    }
  }, 5000);

  async function updateEndpointSettings(endpoint: Pick<LogicalEndpoint, "name" | "track_instances">) {
    await usePatchToServiceControl(`endpointssettings/${endpoint.name}`, { track_instances: !endpoint.track_instances });
    await refresh();
  }

  function endpointDisplayName(endpoint: LogicalEndpoint) {
    const total = endpoint.alive_count + endpoint.down_count;

    if (endpoint.track_instances) {
      return `(${endpoint.alive_count}/${total} instance${total > 1 ? "s" : ""})`;
    } else if (endpoint.alive_count > 0) {
      return `(${endpoint.alive_count})`;
    } else {
      return "";
    }
  }

  function setSelectedEndpointSort(sort: SortOptions<LogicalEndpoint>) {
    //sort value is set/retrieved from cookies in the OrderBy control
    selectedEndpointSort.value = sort;
  }

  function setEndpointFilterString(filter: string) {
    endpointFilterString.value = filter;
  }

  function mapEndpointsToLogical(endpoints: EndpointsView[], settings: EndpointSettings[]): LogicalEndpoint[] {
    const logicalNames = [...new Set(endpoints.map((endpoint) => endpoint.name))];

    return logicalNames.map((endpointName) => {
      const endpointInstances = endpoints.filter((endpoint) => endpoint.name === endpointName);
      const aliveList = endpointInstances.filter((endpoint) => endpoint.monitor_heartbeat && endpoint.heartbeat_information && endpoint.heartbeat_information.reported_status === EndpointStatus.Alive);

      const aliveCount = aliveList.length;
      const downCount = endpointInstances.length - aliveCount;

      return {
        name: endpointName,
        alive_count: aliveCount,
        down_count: downCount,
        track_instances: settings.find((value) => value.name === endpointName)?.track_instances ?? defaultTrackingInstancesValue.value,
        heartbeat_information: {
          reported_status: aliveCount > 0 ? EndpointStatus.Alive : EndpointStatus.Dead,
          last_report_at: endpointInstances.reduce((previousMax: EndpointsView | null, endpoint: EndpointsView) => {
            if (endpoint.heartbeat_information) {
              if (previousMax) {
                return moment.utc(endpoint.heartbeat_information.last_report_at) > moment.utc(previousMax.heartbeat_information!.last_report_at) ? endpoint : previousMax;
              }
              return endpoint;
            }
            return previousMax;
          }, null)?.heartbeat_information?.last_report_at,
        },
        monitor_heartbeat: endpointInstances.some((endpoint) => endpoint.monitor_heartbeat),
      } as LogicalEndpoint;
    });
  }

  const refresh = dataRetriever.executeAndResetTimer;

  refresh().then();

  return {
    refresh,
    defaultTrackingInstancesValue,
    updateEndpointSettings,
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
