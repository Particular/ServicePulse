<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";
import UnassignedQueueActions from "./UnassignedQueueActions.vue";
import { ref } from "vue";
import type { Queue } from "@/resources/LicenseDetails.ts";
import EndpointSelectionModal from "./EndpointSelectionModal.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { unassignedQueues } = storeToRefs(licenseDetailsStore);

const selectedQueue = ref<Queue>();
</script>

<template>
  <div class="alert alert-info mt-1">
    These are queues detected on your message broker that are not currently classified as either endpoints or infrastructure/excluded. It will assist with license renewal to pre-assign these queues to their appropriate classification, prior to
    downloading the usage report
  </div>
  <div class="mt-2" v-if="unassignedQueues.length">
    <QueueData :queues="unassignedQueues" :actions-component="UnassignedQueueActions" :additional-data="{ setSelectedQueue: (queue: Queue) => (selectedQueue = queue) }" />
  </div>
  <NoData v-else message="There are currently no queues that remain unassigned"></NoData>

  <EndpointSelectionModal v-if="selectedQueue" :queue="selectedQueue" @close="selectedQueue = undefined" />
</template>
