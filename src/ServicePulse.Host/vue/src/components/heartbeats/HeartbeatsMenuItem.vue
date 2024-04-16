<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { computed } from "vue";

const store = useHeartbeatsStore();
const numberOfFailedHeatbeats = computed(() => store.inactiveEndpoints.length);
</script>

<template>
  <RouterLink :to="routeLinks.heartbeats.root">
    <i class="fa fa-heartbeat icon-white" title="Heartbeats"></i>
    <span class="navbar-label">Heartbeats</span>
    <span v-if="numberOfFailedHeatbeats > 0" class="badge badge-important">{{ numberOfFailedHeatbeats }}</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
