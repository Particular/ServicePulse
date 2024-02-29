import { computed, reactive, watch } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer";
import { useServiceProductUrls } from "./serviceProductUrls";
import { monitoringUrl, serviceControlUrl, useTypedFetchFromMonitoring, useIsMonitoringDisabled, useTypedFetchFromServiceControl } from "./serviceServiceControlUrls";
import { useShowToast } from "./toast";
import { TYPE } from "vue-toastification";
import type RootUrls from "@/resources/RootUrls";
import type EndpointMonitoringStats from "@/resources/EndpointMonitoringStats";
import type FailedMessageView from "@/resources/FailedMessageView";
import type CustomCheck from "@/resources/CustomCheck";
import type MonitoredEndpoint from "@/resources/MonitoredEndpoint";

export const stats = reactive({
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
  unableToConnect: boolean | null;
}
export const connectionState = reactive<ConnectionState>({
  connected: false,
  connecting: false,
  connectedRecently: false,
  unableToConnect: null,
});

export const monitoringConnectionState = reactive<ConnectionState>({
  connected: false,
  connecting: false,
  connectedRecently: false,
  unableToConnect: null,
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

interface ServiceControlInstanceConnection {
  settings: { [key: string]: Object };
  errors: string[];
}

interface MetricsConnectionDetails {
  Enabled: boolean;
  MetricsQueue?: string;
  Interval?: string;
}

interface Connections {
  serviceControl: ServiceControlInstanceConnection;
  monitoring: {
    settings: MetricsConnectionDetails;
    errors: string[];
  };
}

export const connections = reactive<Connections>({
  serviceControl: {
    settings: {},
    errors: [],
  },
  monitoring: {
    settings: { Enabled: false },
    errors: [],
  },
});

export async function useServiceControl() {
  await Promise.all([useServiceControlStats(), useServiceControlMonitoringStats(), getServiceControlVersion()]);
}

setInterval(() => getServiceControlVersion(), 60000);
setInterval(() => useServiceControlStats(), 5000); //NOTE is 5 seconds too often?
setInterval(() => useServiceControlMonitoringStats(), 5000); //NOTE is 5 seconds too often?

const primaryConnectionFailure = computed(() => connectionState.unableToConnect);
const monitoringConnectionFailure = computed(() => monitoringConnectionState.unableToConnect);

watch(primaryConnectionFailure, (newValue, oldValue) => {
  //NOTE to eliminate success msg showing everytime the screen is refreshed
  if (newValue !== oldValue) {
    if (newValue) {
      useShowToast(TYPE.ERROR, "Error", "Could not connect to ServiceControl at " + serviceControlUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
    } else {
      useShowToast(TYPE.SUCCESS, "Success", "Connection to ServiceControl was successful at " + serviceControlUrl.value + ".");
    }
  }
});

watch(monitoringConnectionFailure, (newValue, oldValue) => {
  // Only watch the state change if monitoring is enabled
  if (useIsMonitoringDisabled()) {
    return;
  }

  //NOTE to eliminate success msg showing everytime the screen is refreshed
  if (newValue !== oldValue) {
    if (newValue) {
      useShowToast(TYPE.ERROR, "Error", "Could not connect to the ServiceControl Monitoring service at " + monitoringUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
    } else {
      useShowToast(TYPE.SUCCESS, "Success", "Connection to ServiceControl Monitoring service was successful at " + monitoringUrl.value + ".");
    }
  }
});

async function useServiceControlStats() {
  const failedHeartBeatsResult = getFailedHeartBeatsCount();
  const failedMessagesResult = getFailedMessagesCount();
  const failedCustomChecksResult = getFailedCustomChecksCount();
  const archivedMessagesResult = getArchivedMessagesCount();
  const pendingRetriesResult = getPendingRetriesCount();

  try {
    const [failedHeartbeats, failedMessages, failedCustomChecks, archivedMessages, pendingRetries] = await Promise.all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult, archivedMessagesResult, pendingRetriesResult]);
    stats.failing_endpoints = failedHeartbeats;
    stats.number_of_failed_messages = failedMessages;
    stats.number_of_failed_checks = failedCustomChecks;
    stats.number_of_failed_heartbeats = failedHeartbeats;
    stats.number_of_archived_messages = archivedMessages;
    stats.number_of_pending_retries = pendingRetries;
  } catch (err) {
    console.log(err);
  }
}

async function useServiceControlMonitoringStats() {
  const monitoredEndpointsResult = getMonitoredEndpoints();
  const disconnectedEndpointsCountResult = getDisconnectedEndpointsCount();

  const [, disconnectedEndpoints] = await Promise.all([monitoredEndpointsResult, disconnectedEndpointsCountResult]);
  //Do something here with the argument to the callback in the future if we are using them
  stats.number_of_disconnected_endpoints = disconnectedEndpoints;
}

export async function useServiceControlConnections() {
  const scConnectionResult = getServiceControlConnection();
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

watch(environment, (newValue, oldValue) => {
  if (newValue.is_compatible_with_sc !== oldValue.is_compatible_with_sc) {
    if (!newValue.is_compatible_with_sc) {
      useShowToast(TYPE.ERROR, "Error", `You are using Service Control version ${newValue.sc_version}. Please, upgrade to version ${newValue.minimum_supported_sc_version} or higher to unlock new functionality in ServicePulse.`);
    }
  }
});

async function getServiceControlVersion() {
  const productsResult = useServiceProductUrls();
  const scResult = getPrimaryVersion();
  const mResult = getMonitoringVersion();

  const [products, scVer] = await Promise.all([productsResult, scResult, mResult]);
  if (scVer) {
    environment.supportsArchiveGroups = !!scVer.archived_groups_url;
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

async function getServiceControlConnection() {
  try {
    const [, data] = await useTypedFetchFromServiceControl<ServiceControlInstanceConnection>("connection");
    return data;
  } catch {
    connections.serviceControl.errors = [`Error reaching ServiceControl at ${serviceControlUrl.value} connection`];
    return null;
  }
}

async function getMonitoringConnection() {
  try {
    if (!useIsMonitoringDisabled()) {
      const [, data] = await useTypedFetchFromMonitoring<{ Metrics: MetricsConnectionDetails }>("connection");
      return data;
    }
  } catch {
    connections.monitoring.errors = [`Error SC Monitoring instance at ${monitoringUrl.value}connection`];
    return undefined;
  }
}

async function getPrimaryVersion() {
  try {
    const [response, data] = await useTypedFetchFromServiceControl<RootUrls>("");
    environment.sc_version = response.headers.get("X-Particular-Version") ?? "";
    return data;
  } catch {
    return null;
  }
}

async function getMonitoringVersion() {
  try {
    const [response] = await useTypedFetchFromMonitoring("");
    if (response) {
      environment.monitoring_version = response.headers.get("X-Particular-Version") ?? "";
    }
  } catch {}
}

async function fetchWithErrorHandling<T, TResult>(fetchFunction: () => Promise<[Response?, T?]>, connectionState: ConnectionState, action: (response: Response, data: T) => TResult, defaultResult: TResult) {
  if (connectionState.connecting) {
    //Skip the connection state checking
    try {
      const [response, data] = await fetchFunction();
      if (response != null && data != null) {
        return await action(response, data);
      }
    } catch (err) {
      console.log(err);
      return defaultResult;
    }
  }
  try {
    if (!connectionState.connected) {
      connectionState.connecting = true;
      connectionState.connected = false;
    }

    try {
      const [response, data] = await fetchFunction();
      let result: TResult | null = null;
      if (response != null && data != null) {
        result = await action(response, data);
      }
      connectionState.unableToConnect = false;
      connectionState.connectedRecently = true;
      connectionState.connected = true;
      connectionState.connecting = false;

      if (result) {
        return result;
      }
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

  return defaultResult;
}

function getFailedHeartBeatsCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromServiceControl<EndpointMonitoringStats>("heartbeats/stats"),
    connectionState,
    (_, data) => {
      return data.failing;
    },
    0
  );
}

function getFailedMessagesCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromServiceControl<FailedMessageView>("errors?status=unresolved"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") ?? ""),
    0
  );
}

function getPendingRetriesCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromServiceControl<FailedMessageView>("errors?status=retryissued"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") ?? "0"),
    0
  );
}

function getArchivedMessagesCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromServiceControl<FailedMessageView>("errors?status=archived"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") ?? "0"),
    0
  );
}

function getFailedCustomChecksCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromServiceControl<CustomCheck[]>("customchecks?status=fail"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count") ?? "0"),
    0
  );
}

function getMonitoredEndpoints() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromMonitoring<MonitoredEndpoint>("monitored-endpoints?history=1"),
    monitoringConnectionState,
    (_, data) => {
      return data;
    },
    null
  );
}

function getDisconnectedEndpointsCount() {
  return fetchWithErrorHandling(
    () => useTypedFetchFromMonitoring<number>("monitored-endpoints/disconnected"),
    monitoringConnectionState,

    (_, data) => {
      return data;
    },
    0
  );
}
