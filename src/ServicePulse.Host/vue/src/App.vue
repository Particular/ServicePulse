<script setup>
import { ref, provide, computed, onMounted, watch } from "vue";
import { RouterView } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import {
  key_ServiceControlUrl,
  key_UnableToConnectToServiceControl,
  key_UnableToConnectToMonitoring,
  key_IsSCConnecting,
  key_IsSCConnected,
  key_ScConnectedAtLeastOnce,
  key_UpdateConnections,
  key_MonitoringUrl,
  key_IsMonitoringEnabled,
  key_IsSCMonitoringConnected,
  key_IsSCMonitoringConnecting,
} from "./composables/keys.js";
import {
  useServiceControlUrls,
  updateServiceControlUrls,
} from "./composables/serviceServiceControlUrls.js";
import {
  useServiceControlStats,
  useServiceControlVersion,
  isServiceControlConnecting,
  isServiceControlConnected,
  serviceControlConnectedAtLeastOnce,
  useServiceControlMonitoringStats,
  isServiceControlMonitoringConnecting,
  isServiceControlMonitoringConnected,
} from "./composables/serviceServiceControl.js";
import { useLicense } from "./composables/serviceLicense.js";
import { useShowToast } from "./composables/toast.js";

onMounted(() => {
  getServiceControlStats();
  getServiceControlMonitoringStats();
});

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls();

provide(key_ServiceControlUrl, serviceControlUrl);
provide(key_MonitoringUrl, monitoringUrl);

useServiceControlVersion(serviceControlUrl.value, monitoringUrl.value);
useLicense(serviceControlUrl.value);

let isSCConnecting = ref(true);
let isSCConnected = ref(null);
let scConnectedAtLeastOnce = ref(false);

let isSCMonitoringConnecting = ref(true);
let isSCMonitoringConnected = ref(null);
let isMonitoringEnabled = computed(() => {
  return (
    monitoringUrl.value !== "!" &&
    monitoringUrl.value !== "" &&
    monitoringUrl.value !== null &&
    monitoringUrl.value !== undefined
  );
});
const unableToConnectToServiceControl = computed(() => {
  return isSCConnecting.value ? false : !isSCConnected.value;
});
const unableToConnectToMonitoring = computed(() => {
  return isSCMonitoringConnecting.value
    ? false
    : !isSCMonitoringConnected.value;
});

function updateConnections(urlParams, newServiceControlUrl, newMonitoringUrl) {
  updateServiceControlUrls(urlParams, newServiceControlUrl, newMonitoringUrl);
}

setInterval(() => getServiceControlStats(), 5000); //NOTE is 5 seconds too often?
setInterval(() => getServiceControlMonitoringStats(), 5000); //NOTE is 5 seconds too often?

function getServiceControlStats() {
  useServiceControlStats(serviceControlUrl.value).then(() => {
    isSCConnecting.value = isServiceControlConnecting.value;
    isSCConnected.value = isServiceControlConnected.value;
    scConnectedAtLeastOnce.value = serviceControlConnectedAtLeastOnce.value;
  });
}
function getServiceControlMonitoringStats() {
  useServiceControlMonitoringStats(monitoringUrl.value).then(() => {
    isSCMonitoringConnecting.value = isServiceControlMonitoringConnecting.value;
    isSCMonitoringConnected.value = isServiceControlMonitoringConnected.value;
  });
}

provide(key_UnableToConnectToServiceControl, unableToConnectToServiceControl);
provide(key_UnableToConnectToMonitoring, unableToConnectToMonitoring);
provide(key_IsSCConnecting, isSCConnecting);
provide(key_IsSCConnected, isSCConnected);
provide(key_ScConnectedAtLeastOnce, scConnectedAtLeastOnce);
provide(key_UpdateConnections, updateConnections);

provide(key_IsMonitoringEnabled, isMonitoringEnabled);
provide(key_IsSCMonitoringConnected, isSCMonitoringConnected);
provide(key_IsSCMonitoringConnecting, isSCMonitoringConnecting);

watch(isSCConnected, async (newValue, oldValue) => {
  if (newValue != oldValue && !(oldValue === null && newValue === true)) {
    //NOTE to eliminate success msg showing everytime the screen is refreshed
    if (!newValue) {
      useShowToast(
        "error",
        "Error",
        "Could not connect to ServiceControl at " +
          serviceControlUrl.value +
          '. <a class="btn btn-default" href="/configuration#connections">View connection settings</a>'
      );
    } else {
      useShowToast(
        "success",
        "Success",
        "Connection to ServiceControl was successful at " +
          serviceControlUrl.value +
          "."
      );
    }
  }
});

watch(isSCMonitoringConnected, async (newValue, oldValue) => {
  if (newValue != oldValue && !(oldValue === null && newValue === true)) {
    //NOTE to eliminate success msg showing everytime the screen is refreshed
    if (!newValue) {
      useShowToast(
        "error",
        "Error",
        "Could not connect to the ServiceControl Monitoring service at " +
          monitoringUrl.value +
          '. <a class="btn btn-default" href="/configuration#connections">View connection settings</a>'
      );
    } else {
      useShowToast(
        "success",
        "Success",
        "Connection to ServiceControl Monitoring service was successful at " +
          monitoringUrl.value +
          "."
      );
    }
  }
});
</script>

<template>
  <page-header />
  <RouterView />
  <page-footer />
</template>
