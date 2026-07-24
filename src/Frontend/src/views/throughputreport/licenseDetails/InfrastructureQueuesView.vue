<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { infrastructureQueues } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <QueueData v-if="infrastructureQueues.length" :queues="infrastructureQueues" />
  <NoData v-else message="There are currently no infrastructure queues associated with your license"></NoData>
</template>
