<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { onClickOutside, useMediaQuery } from "@vueuse/core";
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
import PlatformHealthMenuItem from "@/components/platformhealth/PlatformHealthMenuItem.vue";
import PlatformVersionInfo from "@/components/PlatformVersionInfo.vue";
import monitoringClient from "@/components/monitoring/monitoringClient";
import UserProfileMenuItem from "@/components/UserProfileMenuItem.vue";
import FAIcon from "@/components/FAIcon.vue";
import { faAnglesLeft, faAnglesRight, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/stores/AuthStore";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { useSideBarCollapsed } from "@/composables/useSideBarCollapsed";
import { ApiRoutes } from "@/composables/apiRoutes";
import { storeToRefs } from "pinia";

const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;

const authStore = useAuthStore();
const { authEnabled, isAuthenticated } = storeToRefs(authStore);

const { canCall, ready } = useAllowedRoutes();
const { collapsed, toggleCollapsed } = useSideBarCollapsed();

// Each item gates on the specific route ServiceControl enforces for that area.
// Gate-on-ready: render nothing until permissions are known, so items never appear and
// then disappear. canCall() fails open, so auth-disabled / failed-load shows everything.
// prettier-ignore
const menuItems = computed(() => {
  if (!ready.value) return [];
  return [
    DashboardMenuItem,
    ...(canCall(ApiRoutes.viewHeartbeats) ? [HeartbeatsMenuItem] : []),
    ...(isMonitoringEnabled && canCall(ApiRoutes.viewMonitoredEndpoints) ? [MonitoringMenuItem] : []),
    ...(canCall(ApiRoutes.viewAuditMessages) ? [AuditMenuItem] : []),
    ...(canCall(ApiRoutes.viewFailedMessages) ? [FailedMessagesMenuItem] : []),
    ...(canCall(ApiRoutes.viewCustomChecks) ? [CustomChecksMenuItem] : []),
    ...(canCall(ApiRoutes.viewEventLog) ? [EventsMenuItem] : []),
    PlatformHealthMenuItem,
    ...(canCall(ApiRoutes.viewThroughput) ? [ThroughputMenuItem] : []),
    ConfigurationMenuItem,
  ];
});

// Views size themselves for at least 930px of content, so on medium screens the side bar
// stays a rail and expands over the content instead of pushing it.
const isMedium = useMediaQuery("(min-width: 768px) and (max-width: 1279px)");
const overlayOpen = ref(false);
const railOnly = computed(() => (isMedium.value ? !overlayOpen.value : collapsed.value));

function toggleRail() {
  if (isMedium.value) {
    overlayOpen.value = !overlayOpen.value;
  } else {
    toggleCollapsed();
  }
}

// The collapsed rail shows icons only, so each item names itself on hover and focus.
const labelTooltip = {
  content: (reference: Element) => reference.querySelector(".side-bar-label")?.textContent?.trim() ?? "",
  placement: "right",
  trigger: "mouseenter focusin",
  onShow: () => (railOnly.value ? undefined : false),
};

const drawerOpen = ref(false);
const drawerButton = ref<HTMLButtonElement>();
const sideBar = ref<HTMLElement>();

async function openDrawer() {
  drawerOpen.value = true;
  await nextTick();
  sideBar.value?.querySelector<HTMLElement>("a, button")?.focus();
}

function closeOverlays() {
  overlayOpen.value = false;
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  drawerButton.value?.focus();
}

onClickOutside(sideBar, () => (overlayOpen.value = false));

const route = useRoute();
watch(
  () => route.fullPath,
  () => {
    drawerOpen.value = false;
    overlayOpen.value = false;
  }
);
</script>

<template>
  <header class="mobile-bar">
    <button ref="drawerButton" type="button" class="drawer-button" aria-controls="side-bar" :aria-expanded="drawerOpen" @click="openDrawer">
      <FAIcon :icon="faBars" />
      <span class="sr-only">Open navigation</span>
    </button>
    <RouterLink class="brand" :to="routeLinks.dashboard">
      <img alt="ServicePulse" src="@/assets/logo.svg" />
    </RouterLink>
  </header>

  <div v-if="drawerOpen" class="drawer-backdrop" @click="closeOverlays"></div>
  <div class="side-bar-spacer"></div>

  <aside id="side-bar" ref="sideBar" class="side-bar" :class="{ collapsed: railOnly, open: drawerOpen, overlay: isMedium && overlayOpen }" @keydown.esc="closeOverlays">
    <div class="side-bar-top">
      <RouterLink class="brand" :to="routeLinks.dashboard">
        <img alt="ServicePulse" src="@/assets/logo.svg" />
      </RouterLink>
      <button type="button" class="collapse-button" :aria-expanded="!railOnly" aria-controls="side-bar" v-tippy="railOnly ? 'Expand navigation' : 'Collapse navigation'" @click="toggleRail">
        <FAIcon :icon="railOnly ? faAnglesRight : faAnglesLeft" />
        <span class="sr-only">{{ railOnly ? "Expand navigation" : "Collapse navigation" }}</span>
      </button>
      <button type="button" class="drawer-close" aria-controls="side-bar" @click="closeOverlays">
        <FAIcon :icon="faXmark" />
        <span class="sr-only">Close navigation</span>
      </button>
    </div>

    <nav aria-label="Main">
      <ul class="nav-items">
        <li v-for="menuItem in menuItems" :key="menuItem?.name" v-tippy="labelTooltip">
          <component :is="menuItem" />
        </li>
      </ul>
    </nav>

    <div class="side-bar-bottom">
      <ul class="nav-items">
        <li v-if="authEnabled && isAuthenticated" v-tippy="labelTooltip">
          <UserProfileMenuItem />
        </li>
        <li v-tippy="labelTooltip">
          <FeedbackButton />
        </li>
      </ul>
      <PlatformVersionInfo :collapsed="railOnly" />
    </div>
  </aside>
</template>

<style scoped>
.side-bar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: var(--sp-side-bar-width);
  height: 100vh;
  position: sticky;
  top: 0;
  background-color: var(--sp-chrome);
  color: var(--sp-chrome-ink);
  z-index: 1000;
}

.side-bar.collapsed {
  width: var(--sp-side-bar-collapsed-width);
}

.side-bar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 60px;
  padding: 0 8px 0 16px;
  flex-shrink: 0;
}

.collapsed .side-bar-top {
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 12px 0 4px;
}

.brand img {
  width: 150px;
}

.collapsed .brand {
  width: 32px;
  overflow: hidden;
}

.collapsed .brand img {
  width: 160px;
}

/* Only the item list scrolls, so the user menu at the bottom can open over it without being clipped. */
nav {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.nav-items {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.nav-items :deep(a) {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  min-height: 40px;
  padding: 8px 20px;
  border-left: 4px solid transparent;
  color: var(--sp-chrome-ink);
  text-decoration: none;
  white-space: nowrap;
}

.nav-items :deep(a:hover) {
  background-color: var(--sp-chrome-hover);
  color: var(--sp-chrome-ink-active);
}

.nav-items :deep(a:focus-visible),
.side-bar button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: -2px;
}

.nav-items :deep(a.router-link-active) {
  border-left-color: var(--sp-blue);
  background-color: var(--sp-chrome-hover);
  color: var(--sp-chrome-ink-active);
}

.nav-items :deep(svg) {
  width: 16px;
  flex-shrink: 0;
}

.nav-items :deep(.side-bar-label) {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed .nav-items :deep(a) {
  padding: 8px 0 8px 20px;
}

/* Visually hidden, so the label stays the link's accessible name. */
.collapsed .nav-items :deep(.side-bar-label) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.collapsed .nav-items :deep(.badge) {
  position: absolute;
  top: 2px;
  left: 30px;
  padding: 2px 5px;
  font-size: 10px;
}

.collapsed .nav-items :deep(.fa-triangle-exclamation) {
  position: absolute;
  top: 6px;
  left: 32px;
  width: 12px;
}

.side-bar-bottom {
  border-top: 1px solid var(--sp-chrome-divider);
  flex-shrink: 0;
}

.side-bar button {
  background: none;
  border: none;
  color: var(--sp-chrome-ink);
}

.side-bar button:hover {
  color: var(--sp-chrome-ink-active);
}

.collapse-button {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--sp-radius-sm);
}

.side-bar .collapse-button:hover {
  background-color: var(--sp-chrome-hover);
}

.mobile-bar,
.drawer-close,
.drawer-backdrop,
.side-bar-spacer {
  display: none;
}

@media (min-width: 768px) and (max-width: 1279px) {
  .side-bar-spacer {
    display: block;
    flex-shrink: 0;
    width: var(--sp-side-bar-collapsed-width);
  }

  .side-bar {
    position: fixed;
    left: 0;
  }

  .side-bar.overlay {
    box-shadow: 4px 0 16px rgb(0 0 0 / 30%);
  }
}

@media (max-width: 767px) {
  .mobile-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 56px;
    padding: 0 8px;
    position: sticky;
    top: 0;
    background-color: var(--sp-chrome);
    z-index: 999;
  }

  .mobile-bar .brand img {
    width: 140px;
  }

  .drawer-button {
    width: 44px;
    height: 44px;
    background: none;
    border: none;
    color: #fff;
  }

  .drawer-button:focus-visible {
    outline: 2px solid #fff;
  }

  .side-bar,
  .side-bar.collapsed {
    position: fixed;
    left: 0;
    width: min(var(--sp-side-bar-width), 85vw);
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform 0.2s ease,
      visibility 0.2s;
  }

  /* Visible at once on open, so focus can move into the drawer before the slide finishes. */
  .side-bar.open {
    transform: none;
    visibility: visible;
    transition:
      transform 0.2s ease,
      visibility 0s;
  }

  /* The drawer always shows labels; collapsing applies to wider screens only. */
  .side-bar.collapsed .nav-items :deep(.side-bar-label) {
    position: static;
    width: auto;
    height: auto;
    clip: auto;
  }

  .side-bar.collapsed .nav-items :deep(a) {
    padding: 8px 20px;
  }

  .side-bar.collapsed .side-bar-top {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 8px 0 16px;
  }

  .side-bar.collapsed .brand {
    width: auto;
  }

  .side-bar.collapsed .brand img {
    width: 150px;
  }

  .drawer-close {
    display: block;
    width: 44px;
    height: 44px;
  }

  .collapse-button {
    display: none;
  }

  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 50%);
    z-index: 999;
  }
}

@media (prefers-reduced-motion: reduce) {
  .side-bar {
    transition: none !important;
  }
}
</style>
