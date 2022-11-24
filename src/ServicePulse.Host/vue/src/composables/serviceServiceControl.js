import { reactive, onMounted, watch, computed } from "vue";
import { useIsSupported, useIsUpgradeAvailable } from "./serviceSemVer.js";
import { useServiceProductUrls } from "./serviceProductUrls.js";
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
  connectedAtLeastOnce: false,
  connectedRecently: false,
  unableToConnect: null,
});

export const monitoringConnectionState = reactive({
  connected: false,
  connecting: false,
  connectedAtLeastOnce: false,
  connectedRecently: false,
  unableToConnect: null,
});

export const environment = reactive({
  monitoring_version: "",
  sc_version: "",
  minimum_supported_sc_version: "1.39.0",
  is_compatible_with_sc: true,
  sp_version:
    window.defaultConfig && window.defaultConfig.version
      ? window.defaultConfig.version
      : "1.1.0",
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

export function useServiceControl(serviceControlUrl, monitoringUrl) {
  onMounted(() => {
    useServiceControlStats(serviceControlUrl);
    useServiceControlMonitoringStats(monitoringUrl);
  });

  setInterval(() => useServiceControlStats(serviceControlUrl), 5000); //NOTE is 5 seconds too often?
  setInterval(() => useServiceControlMonitoringStats(monitoringUrl), 5000); //NOTE is 5 seconds too often?

  const scConnectionFailure = computed(() => connectionState.unableToConnect);
  const monitoringConnectionFailure = computed(
    () => monitoringConnectionState.unableToConnect
  );

  watch(scConnectionFailure, async (newValue, oldValue) => {
    //NOTE to eliminate success msg showing everytime the screen is refreshed
    if (newValue != oldValue && !(oldValue === null && newValue === false)) {
      if (newValue) {
        useShowToast(
          "error",
          "Error",
          "Could not connect to ServiceControl at " +
            serviceControlUrl +
            '. <a class="btn btn-default" href="/configuration#connections">View connection settings</a>'
        );
      } else {
        useShowToast(
          "success",
          "Success",
          "Connection to ServiceControl was successful at " +
            serviceControlUrl +
            "."
        );
      }
    }
  });

  watch(monitoringConnectionFailure, async (newValue, oldValue) => {
    //NOTE to eliminate success msg showing everytime the screen is refreshed
    if (newValue != oldValue && !(oldValue === null && newValue === false)) {
      if (newValue) {
        useShowToast(
          "error",
          "Error",
          "Could not connect to the ServiceControl Monitoring service at " +
            monitoringUrl +
            '. <a class="btn btn-default" href="/configuration#connections">View connection settings</a>'
        );
      } else {
        useShowToast(
          "success",
          "Success",
          "Connection to ServiceControl Monitoring service was successful at " +
            monitoringUrl +
            "."
        );
      }
    }
  });
}

export function useServiceControlStats(serviceControlUrl) {
  const failedHeartBeatsResult = getFailedHeartBeatsCount(serviceControlUrl);
  const failedMessagesResult = getFailedMessagesCount(serviceControlUrl);
  const failedCustomChecksResult =
    getFailedCustomChecksCount(serviceControlUrl);

  return Promise.all([
    failedHeartBeatsResult,
    failedMessagesResult,
    failedCustomChecksResult,
  ])
    .then(([failedHB, failedM, failedCC]) => {
      stats.failing_endpoints = failedHB;
      stats.number_of_failed_messages = failedM;
      stats.number_of_failed_checks = failedCC;
      stats.number_of_failed_heartbeats = failedHB;
    })
    .catch((err) => {
      console.log(err);
    });
}

export function useServiceControlMonitoringStats(monitoringUrl) {
  const monitoredEndpointsResult = getMonitoredEndpoints(monitoringUrl);
  const disconnectedEndpointsCountResult =
    getDisconnectedEndpointsCount(monitoringUrl);

  return Promise.all([
    monitoredEndpointsResult,
    disconnectedEndpointsCountResult,
  ]).then(([, disconnectedEndpoints]) => {
    //Do something here with the argument to the callback in the future if we are using them
    stats.number_of_disconnected_endpoints = disconnectedEndpoints;
  });
}

export function useServiceControlConnections(serviceControlUrl, monitoringUrl) {
  const scConnectionResult = getSCConnection(serviceControlUrl);
  const monitoringConnectionResult = getMonitoringConnection(monitoringUrl);

  return Promise.all([scConnectionResult, monitoringConnectionResult]).then(
    ([scConnection, mConnection]) => {
      if (scConnection) {
        connections.serviceControl.settings = scConnection.settings;
        connections.serviceControl.errors = scConnection.errors;
      }

      if (mConnection) {
        connections.monitoring.settings = mConnection.Metrics;
      }

      return connections;
    }
  );
}

export function useServiceControlVersion(serviceControlUrl, monitoringUrl) {
  onMounted(() => {
    getServiceControlVersion(serviceControlUrl, monitoringUrl);
    setInterval(
      () => getServiceControlVersion(serviceControlUrl, monitoringUrl),
      60000
    );
  });

  watch(environment, async (newValue, oldValue) => {
    if (newValue.is_compatible_with_sc != oldValue.is_compatible_with_sc) {
      if (!newValue.is_compatible_with_sc) {
        useShowToast(
          "error",
          "Error",
          "You are using Service Control version " +
            newValue.sc_version +
            ". Please, upgrade to version " +
            newValue.minimum_supported_sc_version.value +
            " or higher to unlock new functionality in ServicePulse."
        );
      }
    }
  });
}

function getServiceControlVersion(serviceControlUrl, monitoringUrl) {
  const productsResult = useServiceProductUrls();
  const scResult = getSCVersion(serviceControlUrl);
  const mResult = getMonitoringVersion(monitoringUrl);

  return Promise.all([productsResult, scResult, mResult]).then(
    ([products, scVer]) => {
      if (scVer) {
        environment.supportsArchiveGroups =
          scVer.archived_groups_url && scVer.archived_groups_url.length > 0;
        environment.is_compatible_with_sc = useIsSupported(
          environment.sc_version,
          environment.minimum_supported_sc_version
        );
        environment.endpoints_error_url = scVer && scVer.endpoints_error_url;
        environment.known_endpoints_url = scVer && scVer.known_endpoints_url;
        environment.endpoints_message_search_url =
          scVer.endpoints_message_search_url;
        environment.endpoints_messages_url = scVer.endpoints_messages_url;
        environment.endpoints_url = scVer.endpoints_url;
        environment.errors_url = scVer.errors_url;
        environment.configuration = scVer.configuration;
        environment.message_search_url = scVer.message_search_url;
        environment.sagas_url = scVer.sagas_url;
      }

      if (
        products.latestSP &&
        useIsUpgradeAvailable(environment.sp_version, products.latestSP.tag)
      ) {
        newVersions.newSPVersion.newspversion = true;
        newVersions.newSPVersion.newspversionlink = products.latestSP.release;
        newVersions.newSPVersion.newspversionnumber = products.latestSP.tag;
      }

      if (
        products.latestSC &&
        useIsUpgradeAvailable(environment.sc_version, products.latestSC.tag)
      ) {
        newVersions.newSCVersion.newscversion = true;
        newVersions.newSCVersion.newscversionlink = products.latestSC.release;
        newVersions.newSCVersion.newscversionnumber = products.latestSC.tag;
      }

      if (
        products.latestSC &&
        useIsUpgradeAvailable(
          environment.monitoring_version,
          products.latestSC.tag
        )
      ) {
        newVersions.newMVersion.newmversion = true;
        newVersions.newMVersion.newmversionlink = products.latestSC.release;
        newVersions.newMVersion.newmversionnumber = products.latestSC.tag;
      }
    }
  );
}

function getSCConnection(serviceControlUrl) {
  return fetch(serviceControlUrl + "connection")
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      connections.serviceControl.errors = [
        "Error reaching ServiceControl at " + serviceControlUrl + "connection",
      ];
      return {};
    });
}

function getMonitoringConnection(monitoringUrl) {
  return fetch(monitoringUrl + "connection")
    .then((response) => {
      return response.json();
    })
    .catch(() => {
      connections.monitoring.errors = [
        "Error SC Monitoring instance at " + monitoringUrl + "connection",
      ];
      return {};
    });
}

function getSCVersion(serviceControlUrl) {
  return fetch(serviceControlUrl)
    .then((response) => {
      environment.sc_version = response.headers.get("X-Particular-Version");
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

function getMonitoringVersion(monitoringUrl) {
  return fetch(monitoringUrl)
    .then((response) => {
      environment.monitoring_version = response.headers.get(
        "X-Particular-Version"
      );
      return response.json();
    })
    .catch(() => {
      return null;
    });
}

function fetchWithErrorHandling(url, connectionState, action) {
  if (connectionState.connecting) {
    //Skip the connection state checking
    return fetch(url)
      .then((response) => action(response))
      .catch((err) => {
        console.log(err);
      });
  }
  try {
    connectionState.connecting = true;
    connectionState.connected = false;
    return fetch(url)
      .then((response) => {
        connectionState.unableToConnect = false;
        connectionState.connectedRecently = true;
        connectionState.connected = true;
        connectionState.connecting = false;
        return response;
      })
      .then((response) => action(response))
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

function getFailedHeartBeatsCount(serviceControlUrl) {
  return fetchWithErrorHandling(
    serviceControlUrl + "heartbeats/stats",
    connectionState,
    (response) => {
      return response.json().then((data) => {
        return parseInt(data.failing);
      });
    }
  );
}

function getFailedMessagesCount(serviceControlUrl) {
  return fetchWithErrorHandling(
    serviceControlUrl + "errors?status=unresolved",
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
  );
}

function getFailedCustomChecksCount(serviceControlUrl) {
  return fetchWithErrorHandling(
    serviceControlUrl + "customchecks?status=fail",
    connectionState,
    (response) => parseInt(response.headers.get("Total-Count"))
  );
}

function getMonitoredEndpoints(monitoringUrl) {
  return fetchWithErrorHandling(
    monitoringUrl + "monitored-endpoints?history=1",
    monitoringConnectionState,
    (response) => response.json()
  );
}

function getDisconnectedEndpointsCount(monitoringUrl) {
  return fetchWithErrorHandling(
    monitoringUrl + "monitored-endpoints/disconnected",
    monitoringConnectionState,
    (response) => response.json()
  );
}
