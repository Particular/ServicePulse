<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import routeLinks from "@/router/routeLinks";
import { useHeartbeatsStore } from "@/stores/HeartbeatsStore";
import { computed } from "vue";
import { useLink } from "vue-router";

const store = useHeartbeatsStore();
const numberOfFailedHeatbeats = computed(() => store.inactiveEndpoints.length);
</script>

<template>
  <DashboardItem :counter="numberOfFailedHeatbeats" :url="useLink({ to: routeLinks.heartbeats.root }).href.value" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
</template>
