<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { stats } from "@/composables/serviceServiceControl";
</script>

<template>
  <RouterLink :to="routeLinks.heartbeats.root">
    <i class="fa fa-heartbeat icon-white" title="Heartbeats"></i>
    <span class="navbar-label">Heartbeats</span>
    <span v-if="stats.number_of_failed_heartbeats > 0" class="badge badge-important">{{ stats.number_of_failed_heartbeats }}</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
