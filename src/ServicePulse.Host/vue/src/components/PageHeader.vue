<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import { connectionState, monitoringConnectionState, stats } from "@/composables/serviceServiceControl";
import { useIsMonitoringEnabled } from "@/composables/serviceServiceControlUrls";
import { licenseStatus } from "@/composables/serviceLicense";
import ExclamationMark from "./ExclamationMark.vue";
import { LicenseWarningLevel } from "@/composables/LicenseStatus";
import { WarningLevel } from "@/components/WarningLevel";
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";

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
        <RouterLink class="navbar-brand" :to="routeLinks.dashboard">
          <img alt="Service Pulse" src="@/assets/logo.svg" />
        </RouterLink>
      </div>

      <div id="navbar" class="navbar navbar-expand-lg">
        <ul class="nav navbar-nav navbar-inverse">
          <li :class="{ active: isRouteSelected(routeLinks.dashboard) }">
            <RouterLink :to="routeLinks.dashboard">
              <i class="fa fa-dashboard icon-white" title="Dashboard"></i>
              <span>Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <a :href="routeLinks.heartbeats">
              <i class="fa fa-heartbeat icon-white" title="Heartbeats"></i>
              <span>Heartbeats</span>
              <span v-if="stats.number_of_failed_heartbeats > 0" class="badge badge-important">{{ stats.number_of_failed_heartbeats }}</span>
            </a>
          </li>
          <li v-if="useIsMonitoringEnabled()" :class="{ active: isRouteSelected(routeLinks.monitoring.root) || isRouteSelected(routeLinks.monitoring.endpointDetails.link('endpointName', 1)) }">
            <RouterLink :to="routeLinks.monitoring.root">
              <i class="fa pa-monitoring icon-white" title="Monitoring"></i>
              <span>Monitoring</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </RouterLink>
          </li>
          <li :class="{ active: isRouteSelected(routeLinks.failedMessage.root) }">
            <RouterLink :to="routeLinks.failedMessage.root">
              <i class="fa fa-envelope icon-white" title="Failed Messages"></i>
              <span>Failed Messages</span>
              <span v-if="stats.number_of_failed_messages > 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </RouterLink>
          </li>
          <li>
            <a :href="routeLinks.customChecks">
              <i class="fa fa-check icon-white" title="Custom Checks"></i>
              <span>Custom Checks</span>
              <span v-if="stats.number_of_failed_checks > 0" class="badge badge-important">{{ stats.number_of_failed_checks }}</span>
            </a>
          </li>
          <li :class="{ active: isRouteSelected(routeLinks.events) }">
            <RouterLink :to="routeLinks.events" exact>
              <i class="fa fa-list-ul icon-white" title="Events"></i>
              <span>Events</span>
            </RouterLink>
          </li>
          <li :class="{ active: isRouteSelected(routeLinks.configuration.root) }">
            <RouterLink :to="routeLinks.configuration.root" exact>
              <i class="fa fa-cog icon-white" title="Configuration"></i>
              <span>Configuration</span>
              <exclamation-mark :type="WarningLevel.Warning" v-if="displayWarn" />
              <exclamation-mark :type="WarningLevel.Danger" v-if="displayDanger" />
            </RouterLink>
          </li>
          <li>
            <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
              <i class="fa fa-comment" title="Feedback"></i>
              <span>Feedback</span>
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
