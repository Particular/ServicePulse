<script setup lang="ts">
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import useTimeoutCountsStoreAutoRefresh from "@/composables/useTimeoutCountsStoreAutoRefresh";

const { store } = useTimeoutCountsStoreAutoRefresh();
const { overdueCount } = storeToRefs(store);
</script>

<template>
  <RouterLink :to="routeLinks.timeouts.root">
    <FAIcon :icon="faHourglassHalf" title="Timeouts" />
    <span class="navbar-label">Timeouts</span>
    <span v-if="overdueCount > 0" class="badge badge-important" aria-label="overdue-timeouts-count" :title="`${overdueCount} overdue timeouts`">{{ overdueCount }}</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
