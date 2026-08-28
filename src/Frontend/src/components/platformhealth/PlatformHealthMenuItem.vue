<script setup lang="ts">
import { RouterLink } from "vue-router";
import { computed } from "vue";
import { faServer } from "@fortawesome/free-solid-svg-icons";
import FAIcon from "@/components/FAIcon.vue";
import ExclamationMark from "@/components/ExclamationMark.vue";
import routeLinks from "@/router/routeLinks";
import { WarningLevel } from "@/components/WarningLevel";
import usePlatformHealthStoreAutoRefresh from "@/composables/usePlatformHealthStoreAutoRefresh";

const { store } = usePlatformHealthStoreAutoRefresh();

const warningLevel = computed(() => {
  if (store.severity === "danger") {
    return WarningLevel.Danger;
  }

  if (store.severity === "warning") {
    return WarningLevel.Warning;
  }

  if (store.outdatedOnly) {
    return WarningLevel.Info;
  }

  return WarningLevel.None;
});

const tooltip = computed(() => {
  if (store.severity === "danger") {
    return "Platform health: Action required. One or more platform instances are unavailable.";
  }

  if (store.severity === "warning") {
    return "Platform health: Attention needed. One or more platform instances are degraded or platform warnings are present.";
  }

  if (store.outdatedOnly) {
    return "Platform health: Update available. One or more platform instances are out of date.";
  }

  return "Platform health: No issues detected.";
});
</script>

<template>
  <RouterLink :to="routeLinks.platformHealth">
    <FAIcon :icon="faServer" />
    <span class="navbar-label">Platform health</span>
    <span title="" class="tooltip-target" v-tippy="tooltip">
      <ExclamationMark :type="warningLevel" v-if="warningLevel !== WarningLevel.None" />
    </span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";

.tooltip-target {
  display: inline-flex;
}
</style>
