<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";
import UnassignedQueueActions from "./UnassignedQueueActions.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { unassignedQueues } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <div class="mt-2" v-if="unassignedQueues.length">
    <QueueData :queues="unassignedQueues" :actions-component="UnassignedQueueActions" />
  </div>
  <NoData v-else message="There are currently no queues that remain unassigned"></NoData>
</template>
