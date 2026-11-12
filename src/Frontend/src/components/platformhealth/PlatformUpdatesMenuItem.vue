<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { faArrowTurnUp, faPlug } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import routeLinks from "@/router/routeLinks";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";

const { store } = usePlatformHealthStoreAutoRefresh();
const isIntegrated = window.defaultConfig.isIntegrated;

// Only actionable status is shown; an up-to-date platform shows nothing.
const updatesAvailable = computed(() => store.outdatedOnly || store.rows.some((row) => row.upgradeAvailable));
</script>

<template>
  <p v-if="isIntegrated" class="status">
    <FAIcon :icon="faPlug" />
    <span class="navbar-label">Integrated ServicePulse</span>
  </p>
  <RouterLink v-else-if="updatesAvailable" class="updates" :to="routeLinks.platformHealth">
    <FAIcon :icon="faArrowTurnUp" />
    <span class="navbar-label">Updates available</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/sidebar-item.css";

.status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 8px 12px;
  color: var(--sp-chrome-ink);
  font-size: 15px;
  line-height: 1.3;
}

.status > svg {
  flex: none;
  width: 18px;
}

a.updates,
a.updates.router-link-active {
  color: var(--sp-brand);
}

a.updates:hover {
  color: var(--sp-chrome-ink-active);
}
</style>
