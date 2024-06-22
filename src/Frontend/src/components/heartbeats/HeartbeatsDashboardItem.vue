<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import routeLinks from "@/router/routeLinks";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";

const store = useHeartbeatsStore();
</script>

<template>
  <!-- <DashboardItem :counter="store.failedHeartbeatsCount" :url="useLink({ to: routeLinks.heartbeats.root }).href.value" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem> -->
  <DashboardItem :counter="store.failedHeartbeatsCount" :url="routeLinks.heartbeats.root" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
</template>
