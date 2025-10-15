<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { storeToRefs } from "pinia";

const statsStore = useConnectionsAndStatsStore();
const { disconnectedEndpointsCount } = storeToRefs(statsStore);
</script>

<template>
  <RouterLink :to="routeLinks.monitoring.root">
    <FAIcon :icon="faChartLine" title="Monitoring" />
    <span class="navbar-label">Monitoring</span>
    <span v-if="disconnectedEndpointsCount > 0" class="badge badge-important">{{ disconnectedEndpointsCount }}</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
