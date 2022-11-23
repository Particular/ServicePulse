<script setup>
import { provide, computed } from "vue";
import { RouterView } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import {
  key_ServiceControlUrl,
  key_UpdateConnections,
  key_MonitoringUrl,
  key_IsMonitoringEnabled,
} from "./composables/keys.js";
import {
  useServiceControlUrls,
  updateServiceControlUrls,
} from "./composables/serviceServiceControlUrls.js";
import {
  useServiceControlVersion,
  useServiceControl,
} from "./composables/serviceServiceControl.js";
import { useLicense } from "./composables/serviceLicense.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls();

provide(key_ServiceControlUrl, serviceControlUrl);
provide(key_MonitoringUrl, monitoringUrl);

useServiceControl(serviceControlUrl.value, monitoringUrl.value);
useServiceControlVersion(serviceControlUrl.value, monitoringUrl.value);
useLicense(serviceControlUrl.value);

let isMonitoringEnabled = computed(() => {
  return (
    monitoringUrl.value !== "!" &&
    monitoringUrl.value !== "" &&
    monitoringUrl.value !== null &&
    monitoringUrl.value !== undefined
  );
});

function updateConnections(urlParams, newServiceControlUrl, newMonitoringUrl) {
  updateServiceControlUrls(urlParams, newServiceControlUrl, newMonitoringUrl);
}

provide(key_UpdateConnections, updateConnections);
provide(key_IsMonitoringEnabled, isMonitoringEnabled);
</script>

<template>
  <page-header />
  <RouterView />
  <page-footer />
</template>
