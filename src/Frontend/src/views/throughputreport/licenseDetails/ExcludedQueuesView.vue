<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { excludedQueues } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <QueueData v-if="excludedQueues.length" :queues="excludedQueues" />
  <NoData v-else message="There are currently no excluded queues associated with your license"></NoData>
</template>
