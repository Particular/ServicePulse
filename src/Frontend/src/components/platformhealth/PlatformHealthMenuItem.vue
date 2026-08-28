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

  return WarningLevel.None;
});
</script>

<template>
  <RouterLink :to="routeLinks.platformHealth">
    <FAIcon :icon="faServer" title="Platform health" />
    <span class="navbar-label">Platform health</span>
    <ExclamationMark :type="warningLevel" v-if="warningLevel !== WarningLevel.None" />
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
