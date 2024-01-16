import { reactive, onMounted, watch, computed } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer.js";
import { useServiceProductUrls } from "./serviceProductUrls.js";
import { useFetchFromServiceControl, useFetchFromMonitoring, serviceControlUrl, monitoringUrl, useIsMonitoringDisabled } from "./serviceServiceControlUrls";
import { useShowToast } from "./toast.js";

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

export const connectionState = reactive({
  connected: false,
  connecting: false,
  connectedRecently: false,
  unableToConnect: null,
});

export const monitoringConnectionState = reactive({
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

export const connections = reactive({
  serviceControl: {
    settings: {},
    errors: [],
  },
  monitoring: {
    settings: {},
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
    if (newValue != oldValue && !(oldValue === null && newValue === false)) {
      if (newValue) {
        useShowToast("error", "Error", "Could not connect to ServiceControl at " + serviceControlUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
      } else {
        useShowToast("success", "Success", "Connection to ServiceControl was successful at " + serviceControlUrl.value + ".");
      }
    }
  });

  // Only watch the state change if monitoring is enabled
  if (!useIsMonitoringDisabled()) {
    watch(monitoringConnectionFailure, async (newValue, oldValue) => {
      //NOTE to eliminate success msg showing everytime the screen is refreshed
      if (newValue != oldValue && !(oldValue === null && newValue === false)) {
        if (newValue) {
          useShowToast("error", "Error", "Could not connect to the ServiceControl Monitoring service at " + monitoringUrl.value + '. <a class="btn btn-default" href="/#/configuration/connections">View connection settings</a>');
        } else {
          useShowToast("success", "Success", "Connection to ServiceControl Monitoring service was successful at " + monitoringUrl.value + ".");
        }
      }
    });
  }
}

export function useServiceControlStats() {
  const failedHeartBeatsResult = getFailedHeartBeatsCount();
  const failedMessagesResult = getFailedMessagesCount();
  const failedCustomChecksResult = getFailedCustomChecksCount();
  const archivedMessagesResult = getArchivedMessagesCount();
  const pendingRetriesResult = getPendingRetriesCount();

  return Promise.all([failedHeartBeatsResult, failedMessagesResult, failedCustomChecksResult, archivedMessagesResult, pendingRetriesResult])
    .then(([failedHeartbeats, failedMessages, failedCustomChecks, archivedMessages, pendingRetries]) => {
      stats.failing_endpoints = failedHeartbeats;
      stats.number_of_failed_messages = failedMessages;
      stats.number_of_failed_checks = failedCustomChecks;
      stats.number_of_failed_heartbeats = failedHeartbeats;
      stats.number_of_archived_messages = archivedMessages;
      stats.number_of_pending_retries = pendingRetries;
    })
    .catch((err) => {
      console.log(err);
    });
}

export function useServiceControlMonitoringStats() {
  const monitoredEndpointsResult = getMonitoredEndpoints();
  const disconnectedEndpointsCountResult = getDisconnectedEndpointsCount();

  return Promise.all([monitoredEndpointsResult, disconnectedEndpointsCountResult]).then(([, disconnectedEndpoints]) => {
    //Do something here with the argument to the callback in the future if we are using them
    stats.number_of_disconnected_endpoints = disconnectedEndpoints;
  });
}

export function useServiceControlConnections() {
  const scConnectionResult = getSCConnection();
  const monitoringConnectionResult = getMonitoringConnection();

  return Promise.all([scConnectionResult, monitoringConnectionResult]).then(([scConnection, mConnection]) => {
    if (scConnection) {
      connections.serviceControl.settings = scConnection.settings;
      connections.serviceControl.errors = scConnection.errors;
    }

    if (mConnection) {
      connections.monitoring.settings = mConnection.Metrics;
    }

    return connections;
  });
}

export function useServiceControlVersion() {
  onMounted(() => {
    getServiceControlVersion();
    setInterval(() => getServiceControlVersion(), 60000);
  });

  watch(environment, async (newValue, oldValue) => {
    if (newValue.is_compatible_with_sc != oldValue.is_compatible_with_sc) {
      if (!newValue.is_compatible_with_sc) {
        useShowToast("error", "Error", "You are using Service Control version " + newValue.sc_version + ". Please, upgrade to version " + newValue.minimum_supported_sc_version.value + " or higher to unlock new functionality in ServicePulse.");
      }
    }
  });
}

function getServiceControlVersion() {
  const productsResult = useServiceProductUrls();
  const scResult = getSCVersion();
  const mResult = getMonitoringVersion();

  return Promise.all([productsResult, scResult, mResult]).then(([products, scVer]) => {
    if (scVer) {
      environment.supportsArchiveGroups = scVer.archived_groups_url && scVer.archived_groups_url.length > 0;
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
  });
}

function getSCConnection() {
  return useFetchFromServiceControl("connection")
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      connections.serviceControl.errors = ["Error reaching ServiceControl at " + serviceControlUrl.value + "connection"];
      return {};
    });
}

function getMonitoringConnection() {
  return useFetchFromMonitoring("connection")
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      connections.monitoring.errors = ["Error SC Monitoring instance at " + monitoringUrl.value + "connection"];
      return {};
    });
}

function getSCVersion() {
  return useFetchFromServiceControl("")
    .then((response) => {
      environment.sc_version = response.headers.get("X-Particular-Version");
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

function getMonitoringVersion() {
  return useFetchFromMonitoring("")
    .then((response) => {
      environment.monitoring_version = response.headers.get("X-Particular-Version");
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

function fetchWithErrorHandling(fetchFunction, connectionState, action) {
  if (connectionState.connecting) {
    //Skip the connection state checking
    return fetchFunction()
      .then((response) => action(response))
      .catch((err) => {
        console.log(err);
      });
  }
  try {
    if (!connectionState.connected) {
      connectionState.connecting = true;
      connectionState.connected = false;
    }

    return fetchFunction()
      .then((response) => action(response))
      .then((response) => {
        connectionState.unableToConnect = false;
        connectionState.connectedRecently = true;
        connectionState.connected = true;
        connectionState.connecting = false;
        return response;
      })
      .catch((err) => {
        connectionState.connected = false;
        connectionState.unableToConnect = true;
        connectionState.connectedRecently = false;
        connectionState.connecting = false;
        console.log(err);
      });
  } catch (err) {
    connectionState.connecting = false;
    connectionState.connected = false;
  }
}

function getFailedHeartBeatsCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("heartbeats/stats"),
    connectionState,
    (response) => {
      return response.json().then((data) => {
        return parseInt(data.failing);
      });
    }
  );
}

function getFailedMessagesCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("errors?status=unresolved"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
  );
}

function getPendingRetriesCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("errors?status=retryissued"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
  );
}

function getArchivedMessagesCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("errors?status=archived"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
  );
}

function getFailedCustomChecksCount() {
  return fetchWithErrorHandling(
    () => useFetchFromServiceControl("customchecks?status=fail"),
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
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
