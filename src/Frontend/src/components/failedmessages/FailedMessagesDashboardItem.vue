<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import routeLinks from "@/router/routeLinks";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { storeToRefs } from "pinia";

const statsStore = useConnectionsAndStatsStore();
const { failedMessageCount } = storeToRefs(statsStore);
</script>

<template>
  <DashboardItem :counter="failedMessageCount" :url="routeLinks.failedMessage.root" :icon="faEnvelope">Failed Messages</DashboardItem>
</template>
