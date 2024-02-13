<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed } from "vue";
import { connectionState, monitoringConnectionState, stats } from "../composables/serviceServiceControl";
import { useIsMonitoringEnabled } from "../composables/serviceServiceControlUrls";
import { licenseStatus } from "../composables/serviceLicense";
import ExclamationMark from "./ExclamationMark.vue";
import { LicenseWarningLevel } from "@/composables/LicenseStatus";
import { WarningLevel } from "@/components/WarningLevel";

const baseUrl = window.defaultConfig.base_url;

function subIsActive(input, exact) {
  const paths = Array.isArray(input) ? input : [input];
  const route = useRoute();
  return paths.some((path) => {
    return exact ? route.path.endsWith(path) : route.path.indexOf(path) === 0; // current path starts with this path string
  });
}

const displayWarn = computed(() => {
  return licenseStatus.warningLevel === LicenseWarningLevel.Warning;
});
const displayDanger = computed(() => {
  return connectionState.unableToConnect || (monitoringConnectionState.unableToConnect && useIsMonitoringEnabled()) || licenseStatus.warningLevel === LicenseWarningLevel.Danger;
});
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-inverse navbar-dark">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand" href="/">
          <img alt="Service Pulse" src="@/assets/logo.svg" />
        </a>
      </div>

      <div id="navbar" class="navbar navbar-expand-lg">
        <ul class="nav navbar-nav navbar-inverse">
          <li :class="{ active: subIsActive('/dashboard', true) }">
            <RouterLink :to="{ name: 'dashboard' }">
              <i class="fa fa-dashboard icon-white" title="Dashboard"></i>
              <span class="navbar-label">Dashboard</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/endpoints') }">
            <a :href="`${baseUrl}a/#/endpoints`">
              <i class="fa fa-heartbeat icon-white" title="Heartbeats"></i>
              <span class="navbar-label">Heartbeats</span>
              <span v-if="stats.number_of_failed_heartbeats > 0" class="badge badge-important">{{ stats.number_of_failed_heartbeats }}</span>
            </a>
          </li>
          <li v-if="useIsMonitoringEnabled()" :class="{ active: subIsActive('/a/#/monitoring') || subIsActive('/a/#/monitoring/endpoint') }">
            <a :href="`${baseUrl}a/#/monitoring`">
              <i class="fa pa-monitoring icon-white" title="Monitoring"></i>
              <span class="navbar-label">Monitoring</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/monitoring') }">
            <RouterLink :to="{ name: 'monitoring' }">
              <i class="fa pa-monitoring icon-white" title="Monitoring"></i>
              <span class="navbar-label">Monitoring New</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/failed-messages') }">
            <RouterLink :to="{ name: 'failed-messages' }">
              <i class="fa fa-envelope icon-white" title="Failed Messages"></i>
              <span class="navbar-label">Failed Messages</span>
              <span v-if="stats.number_of_failed_messages > 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/custom-checks') }">
            <a :href="`${baseUrl}a/#/custom-checks`">
              <i class="fa fa-check icon-white" title="Custom Checks"></i>
              <span class="navbar-label">Custom Checks</span>
              <span v-if="stats.number_of_failed_checks > 0" class="badge badge-important">{{ stats.number_of_failed_checks }}</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/events') }">
            <RouterLink :to="{ name: 'events' }" exact>
              <i class="fa fa-list-ul icon-white" title="Events"></i>
              <span class="navbar-label">Events</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/configuration') }">
            <RouterLink :to="{ name: 'license' }" exact>
              <i class="fa fa-cog icon-white" title="Configuration"></i>
              <span class="navbar-label">Configuration</span>
              <exclamation-mark :type="WarningLevel.Warning" v-if="displayWarn" />
              <exclamation-mark :type="WarningLevel.Danger" v-if="displayDanger" />
            </RouterLink>
          </li>
          <li>
            <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
              <i class="fa fa-comment" title="Feedback"></i>
              <span class="navbar-label">Feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@import "@/assets/navbar.css";

.nav {
  --bs-link-color: #9d9d9d;
  --bs-link-hover-color: #fff;
}

.navbar > .container-fluid > div {
  margin: 0 1em;
}
</style>
