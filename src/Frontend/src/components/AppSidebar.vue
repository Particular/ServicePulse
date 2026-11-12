<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch, type Component } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useEventListener, useStorage } from "@vueuse/core";
import { faAnglesLeft, faAnglesRight, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
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
import AuditMenuItem from "@/components/audit/AuditMenuItem.vue";
import PlatformHealthMenuItem from "@/components/platformhealth/PlatformHealthMenuItem.vue";
import UserProfileMenuItem from "@/components/UserProfileMenuItem.vue";
import PlatformUpdatesMenuItem from "@/components/platformhealth/PlatformUpdatesMenuItem.vue";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { useAuthStore } from "@/stores/AuthStore";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { ApiRoutes } from "@/composables/apiRoutes";

interface NavGroup {
  label?: string;
  items: Component[];
}

const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;

const authStore = useAuthStore();
const { authEnabled, isAuthenticated } = storeToRefs(authStore);

const { canCall, ready } = useAllowedRoutes();

const collapsed = useStorage("sp-sidebar-collapsed", false);
const drawerOpen = ref(false);
const drawerCloseButton = useTemplateRef<HTMLButtonElement>("drawerCloseButton");
const route = useRoute();
watch(
  () => route.fullPath,
  () => (drawerOpen.value = false)
);
// On small screens the sidebar is a drawer: move focus into it when it opens, close it on Escape.
watch(drawerOpen, async (open) => {
  if (open) {
    await nextTick();
    drawerCloseButton.value?.focus();
  }
});
useEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Escape" && drawerOpen.value) drawerOpen.value = false;
});

// Each item gates on the specific route ServiceControl enforces for that area.
// Gate-on-ready: render nothing until permissions are known, so items never appear and
// then disappear. canCall() fails open, so auth-disabled / failed-load shows everything.
// Empty groups are dropped so a heading never stands alone.
// prettier-ignore
const groups = computed<NavGroup[]>(() => {
  if (!ready.value) return [];
  const all: NavGroup[] = [
    { items: [DashboardMenuItem] },
    {
      label: "Recoverability",
      items: [
        ...(canCall(ApiRoutes.viewFailedMessages) ? [FailedMessagesMenuItem] : []),
        ...(canCall(ApiRoutes.viewHeartbeats) ? [HeartbeatsMenuItem] : []),
        ...(canCall(ApiRoutes.viewCustomChecks) ? [CustomChecksMenuItem] : []),
      ],
    },
    { label: "Monitoring", items: isMonitoringEnabled && canCall(ApiRoutes.viewMonitoredEndpoints) ? [MonitoringMenuItem] : [] },
    { label: "Auditing", items: canCall(ApiRoutes.viewAuditMessages) ? [AuditMenuItem] : [] },
    { label: "Platform", items: [PlatformHealthMenuItem, ...(canCall(ApiRoutes.viewEventLog) ? [EventsMenuItem] : [])] },
  ];
  return all.filter((group) => group.items.length > 0);
});

// prettier-ignore
const bottomItems = computed<Component[]>(() => {
  if (!ready.value) return [];
  return [
    ...(canCall(ApiRoutes.viewThroughput) ? [ThroughputMenuItem] : []),
    ConfigurationMenuItem,
    FeedbackButton,
  ];
});

const groupId = (label: string) => `sidebar-group-${label.toLowerCase()}`;
</script>

<template>
  <div class="mobile-bar">
    <button type="button" class="icon-button" aria-controls="sidebar" :aria-expanded="drawerOpen" aria-label="Open navigation" @click="drawerOpen = true">
      <FAIcon :icon="faBars" />
    </button>
    <RouterLink class="mobile-brand" :to="routeLinks.dashboard">
      <img alt="ServicePulse" src="@/assets/logo.svg" />
    </RouterLink>
  </div>
  <div v-if="drawerOpen" class="sidebar-backdrop" @click="drawerOpen = false"></div>
  <nav id="sidebar" class="sidebar" :class="{ collapsed, open: drawerOpen }" aria-label="Main">
    <div class="sidebar-header">
      <RouterLink class="sidebar-brand" :to="routeLinks.dashboard">
        <img alt="ServicePulse" src="@/assets/logo.svg" />
      </RouterLink>
      <button type="button" class="icon-button collapse-toggle" :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'" :aria-expanded="!collapsed" @click="collapsed = !collapsed">
        <FAIcon :icon="collapsed ? faAnglesRight : faAnglesLeft" />
      </button>
      <button ref="drawerCloseButton" type="button" class="icon-button drawer-close" aria-label="Close navigation" @click="drawerOpen = false">
        <FAIcon :icon="faXmark" />
      </button>
    </div>

    <div class="sidebar-main">
      <section v-for="group in groups" :key="group.label ?? 'top'" class="sidebar-group" :aria-labelledby="group.label ? groupId(group.label) : undefined">
        <p v-if="group.label" :id="groupId(group.label)" class="sidebar-group-label">{{ group.label }}</p>
        <ul>
          <li v-for="(item, index) in group.items" :key="index">
            <component :is="item" />
          </li>
        </ul>
      </section>
    </div>

    <div class="sidebar-bottom">
      <PlatformUpdatesMenuItem />
      <ul>
        <li v-for="(item, index) in bottomItems" :key="index">
          <component :is="item" />
        </li>
        <li v-if="authEnabled && isAuthenticated">
          <UserProfileMenuItem />
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex: none;
  flex-direction: column;
  width: var(--sp-sidebar-width);
  height: 100%;
  background: var(--sp-chrome);
  color: var(--sp-chrome-ink);
  transition: width 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 12px 14px 16px;
}

.sidebar-brand {
  display: block;
  overflow: hidden;
  border-radius: var(--sp-radius-sm);
}

.sidebar-brand img {
  display: block;
  width: 160px;
  height: auto;
}

.sidebar-brand:focus-visible,
.icon-button:focus-visible {
  outline: 2px solid var(--sp-brand);
  outline-offset: 2px;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--sp-radius-sm);
  background: transparent;
  color: var(--sp-chrome-ink);
  cursor: pointer;
}

.icon-button:hover {
  background: var(--sp-chrome-hover);
  color: var(--sp-chrome-ink-active);
}

.drawer-close {
  display: none;
}

.sidebar-main {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 16px;
}

.sidebar-group + .sidebar-group {
  margin-top: 20px;
}

.sidebar-group-label {
  margin: 0 0 6px;
  padding: 0 12px;
  color: var(--sp-chrome-ink-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.4;
  text-transform: uppercase;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 8px;
  border-top: 1px solid var(--sp-chrome-divider);
}

/* Collapsed: an icon rail. Labels stay in the accessibility tree. */
.sidebar.collapsed {
  width: var(--sp-sidebar-width-collapsed);
}

.sidebar.collapsed .sidebar-header {
  flex-direction: column;
  padding: 14px 8px;
}

.sidebar.collapsed .sidebar-brand {
  width: 40px;
}

.sidebar.collapsed .sidebar-group + .sidebar-group {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--sp-chrome-divider);
}

.sidebar.collapsed .sidebar-group-label,
.sidebar.collapsed :deep(.navbar-label) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.sidebar.collapsed :deep(a),
.sidebar.collapsed :deep(.status) {
  position: relative;
  justify-content: center;
}

.sidebar.collapsed :deep(.badge),
.sidebar.collapsed :deep(a > svg + svg),
.sidebar.collapsed :deep(.tooltip-target) {
  position: absolute;
  top: 2px;
  right: 2px;
}

.mobile-bar,
.sidebar-backdrop {
  display: none;
}

/* Small screens: a top bar with a menu button opens the sidebar as a drawer. */
@media (max-width: 767px) {
  .mobile-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--sp-chrome);
  }

  .mobile-brand img {
    display: block;
    width: 140px;
  }

  .sidebar,
  .sidebar.collapsed {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 1050;
    width: min(var(--sp-sidebar-width), 85vw);
    transform: translateX(-100%);
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .sidebar.open {
    transform: none;
  }

  .sidebar.collapsed .sidebar-header {
    flex-direction: row;
  }

  .collapse-toggle {
    display: none;
  }

  .drawer-close {
    display: inline-flex;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1040;
    background: rgb(0 0 0 / 0.45);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar.collapsed {
    transition: none;
  }
}
</style>
