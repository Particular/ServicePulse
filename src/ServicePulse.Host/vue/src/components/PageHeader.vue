<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useIsMonitoringEnabled } from "@/composables/serviceServiceControlUrls";
import { stats } from "@/composables/serviceServiceControl";
import routeLinks from "@/router/routeLinks";
import CustomChecksMenuItem from "@/components/customchecks/CustomChecksMenuItem.vue";
import HeartbeatsMenuItem from "./heartbeats/HeartbeatsMenuItem.vue";
import ConfigurationMenuItem from "./configuration/ConfigurationMenuItem.vue";
import FailedMessagesMenuItem from "./failedmessages/FailedMessagesMenuItem.vue";
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
          <li>
            <RouterLink :to="routeLinks.dashboard">
              <i class="fa fa-dashboard icon-white" title="Dashboard"></i>
              <span class="navbar-label">Dashboard</span>
            </RouterLink>
          </li>
          <li>
            <HeartbeatsMenuItem />
          </li>
          <li v-if="useIsMonitoringEnabled()">
            <RouterLink :to="routeLinks.monitoring.root">
              <i class="fa pa-monitoring icon-white" title="Monitoring"></i>
              <span class="navbar-label">Monitoring</span>
              <span v-if="stats.number_of_disconnected_endpoints > 0" class="badge badge-important">{{ stats.number_of_disconnected_endpoints }}</span>
            </RouterLink>
          </li>
          <li>
            <FailedMessagesMenuItem />
          </li>
          <li>
            <CustomChecksMenuItem />
          </li>
          <li>
            <RouterLink :to="routeLinks.events">
              <i class="fa fa-list-ul icon-white" title="Events"></i>
              <span class="navbar-label">Events</span>
            </RouterLink>
          </li>
          <li>
            <ConfigurationMenuItem />
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
@import "@/assets/header-menu-item.css";
</style>
