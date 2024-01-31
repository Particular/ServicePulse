import { computed, onMounted, reactive, watch } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer";
import { useServiceProductUrls } from "./serviceProductUrls";
import { monitoringUrl, serviceControlUrl, useFetchFromMonitoring, useFetchFromServiceControl, useIsMonitoringDisabled } from "./serviceServiceControlUrls";
import { useShowToast } from "./toast";
import { TYPE } from "vue-toastification";

interface Stats {
  active_endpoints: number;
  failing_endpoints: number;
  number_of_exception_groups: number;
  number_of_failed_messages: number;
  number_of_failed_checks: number;
  number_of_failed_heartbeats: number;
  number_of_archived_messages: number;
  number_of_pending_retries: number;
  number_of_endpoints: number;
  number_of_disconnected_endpoints: number;
}
export const stats = reactive<Stats>({
  active_endpoints: 0,
  failing_endpoints: 0,
  number_of_exception_groups: 0,
  number_of_failed_messages: 0,
  number_of_failed_checks: 0,
  number_of_failed_heartbeats: 0,
  number_of_archived_messages: 0,
  number_of_pending_retries: 0,
  number_of_endpoints: 0,
  number_of_disconnected_endpoints: 0,
});

interface ConnectionState {
  connected: boolean;
  connecting: boolean;
  connectedRecently: boolean;
  unableToConnect: boolean;
}

export const connectionState = reactive<ConnectionState>({
  connected: false,
  connecting: false,
  connectedRecently: false,
  unableToConnect: true,
});

export const monitoringConnectionState = reactive<ConnectionState>({
  connected: false,
  connecting: false,
  connectedRecently: false,
  unableToConnect: true,
});

export const environment = reactive({
  monitoring_version: "",
  sc_version: "",
  minimum_supported_sc_version: "1.39.0",
  is_compatible_with_sc: true,
  sp_version: window.defaultConfig && window.defaultConfig.version ? window.defaultConfig.version : "1.1.0",
  supportsArchiveGroups: false,
  endpoints_error_url: "",
  known_endpoints_url: "",
  endpoints_message_search_url: "",
  endpoints_messages_url: "",
  endpoints_url: "",
  errors_url: "",
  configuration: "",
  message_search_url: "",
  sagas_url: "",
});

export const newVersions = reactive({
  newSPVersion: {
    newspversion: false,
    newspversionlink: "",
    newspversionnumber: "",
  },
  newSCVersion: {
    newscversion: false,
    newscversionlink: "",
    newscversionnumber: "",
  },
  newMVersion: {
    newmversion: false,
    newmversionlink: "",
    newmversionnumber: "",
  },
});

interface Connections {
  serviceControl: SCConnection;
  monitoring: {
    settings: MetricsSettings;
    errors: string[];
  };
}

const connections = reactive<Connections>({
  serviceControl: {
    settings: {},
    errors: [],
  },
  monitoring: {
    settings: { Enabled: false, Interval: "", MetricsQueue: "" },
    errors: [],
  },
});

export function useServiceControl() {
  onMounted(() => {
    useServiceControlStats();
    useServiceControlMonitoringStats();
  });

  setInterval(() => useServiceControlStats(), 5000); //NOTE is 5 seconds too often?
  setInterval(() => useServiceControlMonitoringStats(), 5000); //NOTE is 5 seconds too often?

  const scConnectionFailure = computed(() => connectionState.unableToConnect);
  const monitoringConnectionFailure = computed(() => monitoringConnectionState.unableToConnect);

  watch(scConnectionFailure, async (newValue, oldValue) => {
    //NOTE to eliminate success msg showing everytime the screen is refreshed
    if (newValue != oldValue && !(oldValue === null && !newValue)) {
      if (newValue) {
        useShowToast(TYPE.ERROR, "Error", "Could not connect to ServiceControl at " + serviceControlUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
      } else {
        useShowToast(TYPE.SUCCESS, "Success", "Connection to ServiceControl was successful at " + serviceControlUrl.value + ".");
      }
    }
  });

  // Only watch the state change if monitoring is enabled
  if (!useIsMonitoringDisabled()) {
    watch(monitoringConnectionFailure, async (newValue, oldValue) => {
      //NOTE to eliminate success msg showing everytime the screen is refreshed
      if (newValue != oldValue && !(oldValue === null && !newValue)) {
        if (newValue) {
          useShowToast(TYPE.ERROR, "Error", "Could not connect to the ServiceControl Monitoring service at " + monitoringUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
        } else {
          useShowToast(TYPE.SUCCESS, "Success", "Connection to ServiceControl Monitoring service was successful at " + monitoringUrl.value + ".");
        }
      }
    });
  }
}

export async function useServiceControlStats() {
  const failedHeartBeatsResult = getFailedHeartBeatsCount();
  const failedMessagesResult = getFailedMessagesCount();
  const failedCustomChecksResult = getFailedCustomChecksCount();
  const archivedMessagesResult = getArchivedMessagesCount();
  const pendingRetriesResult = getPendingRetriesCount();

  try {
    const [failedHeartbeats, failedMessages, failedCustomChecks, archivedMessages, pendingRetries] = await Promise.all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult, archivedMessagesResult, pendingRetriesResult]);
    stats.failing_endpoints = failedHeartbeats || 0;
    stats.number_of_failed_messages = failedMessages || 0;
    stats.number_of_failed_checks = failedCustomChecks || 0;
    stats.number_of_failed_heartbeats = failedHeartbeats || 0;
    stats.number_of_archived_messages = archivedMessages || 0;
    stats.number_of_pending_retries = pendingRetries || 0;
  } catch (err) {
    console.log(err);
  }
}

export async function useServiceControlMonitoringStats() {
  const monitoredEndpointsResult = getMonitoredEndpoints();
  const disconnectedEndpointsCountResult = getDisconnectedEndpointsCount();

  const [, disconnectedEndpoints] = await Promise.all([monitoredEndpointsResult, disconnectedEndpointsCountResult]);
  stats.number_of_disconnected_endpoints = disconnectedEndpoints;
}

export async function useServiceControlConnections() {
  const scConnectionResult = getSCConnection();
  const monitoringConnectionResult = getMonitoringConnection();

  const [scConnection, mConnection] = await Promise.all([scConnectionResult, monitoringConnectionResult]);
  if (scConnection) {
    connections.serviceControl.settings = scConnection.settings;
    connections.serviceControl.errors = scConnection.errors;
  }
  if (mConnection) {
    connections.monitoring.settings = mConnection.Metrics;
  }
  return connections;
}

export function useServiceControlVersion() {
  onMounted(() => {
    getServiceControlVersion();
    setInterval(() => getServiceControlVersion(), 60000);
  });

  watch(environment, async (newValue, oldValue) => {
    if (newValue.is_compatible_with_sc !== oldValue.is_compatible_with_sc) {
      if (!newValue.is_compatible_with_sc) {
        useShowToast(TYPE.ERROR, "Error", "You are using Service Control version " + newValue.sc_version + ". Please, upgrade to version " + newValue.minimum_supported_sc_version + " or higher to unlock new functionality in ServicePulse.");
      }
    }
  });
}

async function getServiceControlVersion() {
  const productsResult = useServiceProductUrls();
  const scResult = getSCVersion();
  const mResult = getMonitoringVersion();

  const [products, scVer] = await Promise.all([productsResult, scResult, mResult]);
  if (scVer) {
    environment.supportsArchiveGroups = scVer.archived_groups_url !== undefined && scVer.archived_groups_url.length > 0;
    environment.is_compatible_with_sc = useIsSupported(environment.sc_version, environment.minimum_supported_sc_version);
    environment.endpoints_error_url = scVer && scVer.endpoints_error_url;
    environment.known_endpoints_url = scVer && scVer.known_endpoints_url;
    environment.endpoints_message_search_url = scVer.endpoints_message_search_url;
    environment.endpoints_messages_url = scVer.endpoints_messages_url;
    environment.endpoints_url = scVer.endpoints_url;
    environment.errors_url = scVer.errors_url;
    environment.configuration = scVer.configuration;
    environment.message_search_url = scVer.message_search_url;
    environment.sagas_url = scVer.sagas_url;
  }
  if (products.latestSP && useIsUpgradeAvailable(environment.sp_version, products.latestSP.tag)) {
    newVersions.newSPVersion.newspversion = true;
    newVersions.newSPVersion.newspversionlink = products.latestSP.release;
    newVersions.newSPVersion.newspversionnumber = products.latestSP.tag;
  }
  if (products.latestSC && useIsUpgradeAvailable(environment.sc_version, products.latestSC.tag)) {
    newVersions.newSCVersion.newscversion = true;
    newVersions.newSCVersion.newscversionlink = products.latestSC.release;
    newVersions.newSCVersion.newscversionnumber = products.latestSC.tag;
  }
  if (products.latestSC && useIsUpgradeAvailable(environment.monitoring_version, products.latestSC.tag)) {
    newVersions.newMVersion.newmversion = true;
    newVersions.newMVersion.newmversionlink = products.latestSC.release;
    newVersions.newMVersion.newmversionnumber = products.latestSC.tag;
  }
}

interface SCConnection {
  settings: { [key: string]: Object };
  errors: string[];
}

async function getSCConnection() {
  try {
    let response = await useFetchFromServiceControl("connection");
    return (await response.json()) as unknown as SCConnection;
  } catch (e) {
    connections.serviceControl.errors = ["Error reaching ServiceControl at " + serviceControlUrl.value + "connection"];
    return undefined;
  }
}

interface MetricsSettings {
  Enabled: boolean;
  MetricsQueue: string;
  Interval: string;
}

interface MetricsConnection {
  Metrics: MetricsSettings;
}

async function getMonitoringConnection() {
  try {
    let response = await useFetchFromMonitoring("connection");
    if (response !== undefined) {
      return response.json() as unknown as MetricsConnection;
    }
    return undefined;
  } catch (e) {
    connections.monitoring.errors = ["Error SC Monitoring instance at " + monitoringUrl.value + "connection"];
    return undefined;
  }
}

interface RootUrls {
  endpoints_url: string;
  known_endpoints_url: string;
  sagas_url: string;
  errors_url: string;
  endpoints_error_url: string;
  message_search_url: string;
  endpoints_message_search_url: string;
  endpoints_messages_url: string;
  audit_count_url: string;
  name: string;
  description: string;
  license_status: string;
  license_details: string;
  configuration: string;
  remote_configuration: string;
  event_log_items: string;
  archived_groups_url: string;
  get_archive_group: string;
}

async function getSCVersion() {
  try {
    let response = await useFetchFromServiceControl("");
    environment.sc_version = response.headers.get("X-Particular-Version") || "";
    return (await response.json()) as unknown as RootUrls;
  } catch (e) {
    return undefined;
  }
}

async function getMonitoringVersion() {
  try {
    let response = await useFetchFromMonitoring("");
    if (response !== undefined) {
      environment.monitoring_version = response.headers.get("X-Particular-Version") || "";
      return response.json();
    }
  } catch (e) {
    return undefined;
  }
}

async function fetchWithErrorHandling<T>(fetchFunction: () => Promise<Response | undefined>, connectionState: ConnectionState, action: (response: Response) => T) {
  if (connectionState.connecting) {
    //Skip the connection state checking
    try {
      const response = await fetchFunction();
      if (response !== undefined) {
        return action(response);
      }
    } catch (err) {
      console.log(err);
    }
    return undefined;
  }
  try {
    if (!connectionState.connected) {
      connectionState.connecting = true;
      connectionState.connected = false;
    }

    try {
      const response = await fetchFunction();
      const result = response !== undefined ? action(response) : undefined;
      connectionState.unableToConnect = false;
      connectionState.connectedRecently = true;
      connectionState.connected = true;
      connectionState.connecting = false;
      return result;
    } catch (err) {
      connectionState.connected = false;
      connectionState.unableToConnect = true;
      connectionState.connectedRecently = false;
      connectionState.connecting = false;
      console.log(err);
    }
  } catch (err) {
    connectionState.connecting = false;
    connectionState.connected = false;
  }

  return undefined;
}

interface EndpointMonitoringStats {
  active: number;
  failing: number;
}

async function getFailedHeartBeatsCount() {
  return await fetchWithErrorHandling<Promise<number>>(
    () => useFetchFromServiceControl("heartbeats/stats"),
    connectionState,
    async (response) => {
      const data = (await response.json()) as unknown as EndpointMonitoringStats;
      return data.failing;
    }
  );
}

function getFailedMessagesCount() {
  return fetchWithErrorHandling<number>(
    () => useFetchFromServiceControl("errors?status=unresolved"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") || "0")
  );
}

function getPendingRetriesCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("errors?status=retryissued"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") || "0")
  );
}

function getArchivedMessagesCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("errors?status=archived"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") || "0")
  );
}

function getFailedCustomChecksCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("customchecks?status=fail"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") || "0")
  );
}

function getMonitoredEndpoints() {
  return fetchWithErrorHandling(
    () => useFetchFromMonitoring("monitored-endpoints?history=1"),
    monitoringConnectionState,
    (response) => {
      if (response != null && response.ok) {
        return response.json();
      }
      throw "Error connecting to monitoring";
    }
  );
}

function getDisconnectedEndpointsCount() {
  return fetchWithErrorHandling(
    () => useFetchFromMonitoring("monitored-endpoints/disconnected"),
    monitoringConnectionState,
    (response) => {
      if (response != null && response.ok) {
        return response.json();
      }
      throw "Error connecting to monitoring";
    }
  );
}
