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
import { useUserPermissionsStore } from "@/stores/UserPermissionsStore";
import { storeToRefs } from "pinia";
import type { PermissionsSummary } from "@/stores/UserPermissionsStore";

const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;

const authStore = useAuthStore();
const { authEnabled, isAuthenticated } = storeToRefs(authStore);

const permissionsStore = useUserPermissionsStore();
const { summary } = storeToRefs(permissionsStore);

const shouldGate = computed(() => authEnabled.value && isAuthenticated.value && summary.value !== null);

function has(flag: keyof PermissionsSummary): boolean {
  return !shouldGate.value || summary.value?.[flag] === true;
}

// prettier-ignore
const menuItems = computed(
  () => [
  DashboardMenuItem,
  ...(has("failed_messages_read") ? [HeartbeatsMenuItem] : []),
  ...(isMonitoringEnabled && has("monitoring_read") ? [MonitoringMenuItem] : []),
  ...(has("auditing_read") ? [AuditMenuItem] : []),
  ...(has("failed_messages_read") ? [FailedMessagesMenuItem] : []),
  ...(has("failed_messages_read") ? [CustomChecksMenuItem] : []),
  ...(has("failed_messages_read") ? [EventsMenuItem] : []),
  ...(has("failed_messages_read") ? [ThroughputMenuItem] : []),
  ConfigurationMenuItem,
  FeedbackButton,
]);
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
