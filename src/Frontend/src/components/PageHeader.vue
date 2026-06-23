<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import CustomChecksMenuItem from "@/components/customchecks/CustomChecksMenuItem.vue";
import HeartbeatsMenuItem from "@/components/heartbeats/HeartbeatsMenuItem.vue";
import ConfigurationMenuItem from "@/components/configuration/ConfigurationMenuItem.vue";
import FailedMessagesMenuItem from "@/components/failedmessages/FailedMessagesMenuItem.vue";
import MonitoringMenuItem from "@/components/monitoring/MonitoringMenuItem.vue";
import EventsMenuItem from "@/components/events/EventsMenuItem.vue";
import DashboardMenuItem from "@/components/dashboard/DashboardMenuItem.vue";
import FeedbackButton from "@/components/FeedbackButton.vue";
import ThroughputMenuItem from "@/views/throughputreport/ThroughputMenuItem.vue";
import AuditMenuItem from "./audit/AuditMenuItem.vue";
import monitoringClient from "@/components/monitoring/monitoringClient";
import UserProfileMenuItem from "@/components/UserProfileMenuItem.vue";
import { useAuthStore } from "@/stores/AuthStore";
import { usePermissions } from "@/composables/usePermissions";
import { storeToRefs } from "pinia";

const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;

const authStore = useAuthStore();
const { authEnabled, isAuthenticated } = storeToRefs(authStore);

const { can, ready } = usePermissions();

// Each item gates on the specific permission ServiceControl enforces for that area.
// Gate-on-ready: render nothing until permissions are known, so items never appear and
// then disappear. can() fails open, so auth-disabled / failed-load shows everything.
// prettier-ignore
const menuItems = computed(() => {
  if (!ready.value) return [];
  return [
    DashboardMenuItem,
    ...(can("error:heartbeats:view") ? [HeartbeatsMenuItem] : []),
    ...(isMonitoringEnabled && can("monitoring:endpoint:view") ? [MonitoringMenuItem] : []),
    ...(can("audit:message:view") ? [AuditMenuItem] : []),
    ...(can("error:messages:view") ? [FailedMessagesMenuItem] : []),
    ...(can("error:customchecks:view") ? [CustomChecksMenuItem] : []),
    ...(can("error:eventlog:view") ? [EventsMenuItem] : []),
    ...(can("error:throughput:view") ? [ThroughputMenuItem] : []),
    ConfigurationMenuItem,
    FeedbackButton,
  ];
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
          <li v-for="menuItem in menuItems" :key="menuItem?.name">
            <component :is="menuItem" />
          </li>
          <li v-if="authEnabled && isAuthenticated">
            <UserProfileMenuItem />
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
