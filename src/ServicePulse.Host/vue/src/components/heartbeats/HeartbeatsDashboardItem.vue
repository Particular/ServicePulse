<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import { stats } from "@/composables/serviceServiceControl";
import routeLinks from "@/router/routeLinks";
import { useLink } from "vue-router";
</script>

<template>
  <DashboardItem :counter="stats.number_of_failed_heartbeats" :url="useLink({ to: routeLinks.heartbeats.root }).href.value" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
</template>
