<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import routeLinks from "@/router/routeLinks";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { faHeartbeat } from "@fortawesome/free-solid-svg-icons";

const store = useHeartbeatsStore();
</script>

<template>
  <DashboardItem :counter="store.failedHeartbeatsCount" :url="routeLinks.heartbeats.root" :icon="faHeartbeat">Heartbeats</DashboardItem>
</template>
