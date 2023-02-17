<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed } from "vue";
import ExclamationMark from "./ExclamationMark.vue";
import { stats, connectionState, monitoringConnectionState } from "../composables/serviceServiceControl.js";
import { licenseStatus } from "./../composables/serviceLicense.js";

function subIsActive(input, exact) {
  const paths = Array.isArray(input) ? input : [input];
  const route = useRoute();
  return paths.some((path) => {
    return exact ? route.path.endsWith(path) : route.path.indexOf(path) === 0; // current path starts with this path string
  });
}

const displayWarn = computed(() => {
  return licenseStatus.warningLevel === "warning";
});
const displayDanger = computed(() => {
  return connectionState.unableToConnect || monitoringConnectionState.unableToConnect || licenseStatus.warningLevel === "danger";
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
              <i class="fa fa-dashboard icon-white"></i>
              <span class="navbar-label">Dashboard</span>
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/endpoints') }">
            <a href="/a/#/endpoints">
              <i class="fa fa-heartbeat icon-white"></i>
              <span class="navbar-label">Heartbeats</span>
              <span v-if="stats.number_of_failed_heartbeats > 0" class="badge badge-important">{{ stats.number_of_failed_heartbeats }}</span>
            </a>
          </li>
          <li
            :class="{
              active: subIsActive('/a/#/monitoring') || subIsActive('/a/#/monitoring/endpoint'),
            }"
          >
            <a href="/a/#/monitoring">
              <i class="fa pa-monitoring icon-white"></i>
              <span class="navbar-label">Monitoring</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </a>
          </li>
          <li
            :class="{
              active: subIsActive('/a/#/failed-messages/groups') || subIsActive('/a/#/failed-messages/all') || subIsActive('/a/#/failed-messages/archived') || subIsActive('/a/#/failed-messages/pending-retries'),
            }"
          >
            <a href="/a/#/failed-messages/groups">
              <i class="fa fa-envelope icon-white"></i>
              <span class="navbar-label">Failed Messages (AngularJS)</span>
              <span v-if="stats.number_of_failed_messages > 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </a>
          </li>
          <li
            :class="{
              active: subIsActive('/failed-messages'),
            }"
          >
            <RouterLink :to="{ name: 'failed-messages' }">
              <i class="fa fa-envelope icon-white"></i>
              <span class="navbar-label">Failed Messages</span>
              <span v-if="stats.number_of_failed_messages > 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </RouterLink>
                class="badge badge-important"
                >{{ stats.number_of_failed_messages }}</span
              >
            </RouterLink>
          </li>
          <li :class="{ active: subIsActive('/a/#/custom-checks') }">
            <a href="/a/#/custom-checks">
              <i class="fa fa-check icon-white"></i>
              <span class="navbar-label">Custom Checks</span>
              <span v-if="stats.number_of_failed_checks > 0" class="badge badge-important">{{ stats.number_of_failed_checks }}</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/a/#/events') }">
            <a href="/a/#/events">
              <i class="fa fa-list-ul icon-white"></i>
              <span class="navbar-label">Events</span>
            </a>
          </li>
          <li :class="{ active: subIsActive('/configuration') }">
            <RouterLink :to="{ name: 'configuration' }" exact>
              <i class="fa fa-cog icon-white"></i>
              <span class="navbar-label">Configuration</span>
              <exclamation-mark :type="'warning'" v-if="displayWarn" />
              <exclamation-mark :type="'danger'" v-if="displayDanger" />
            </RouterLink>
          </li>
          <li>
            <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
              <i class="fa fa-comment"></i>
              <span class="navbar-label">Feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style></style>
