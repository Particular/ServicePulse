<script setup lang="ts">
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import QueueData from "./QueueData.vue";
import NoData from "@/components/NoData.vue";
import UnassignedQueueActions from "./UnassignedQueueActions.vue";
import { ref } from "vue";
import type { Endpoint, Queue } from "@/resources/LicenseDetails.ts";
import ModalDialog from "@/components/ModalDialog.vue";
import EndpointSelectionQueueDisplay from "./EndpointSelectionQueueDisplay.vue";
import ActionButton from "@/components/ActionButton.vue";

const licenseDetailsStore = useLicenseDetailsStore();
const { unassignedQueues, endpoints } = storeToRefs(licenseDetailsStore);

const selectedQueue = ref<Queue>();

function assignQueue(endpoint: Endpoint) {
  if (!selectedQueue.value) return;
  licenseDetailsStore.addQueueToEndpoint(selectedQueue.value, endpoint);
  selectedQueue.value = undefined;
}
</script>

<template>
  <div class="alert alert-info mt-1">
    These are queues detected on your message broker that are not currently classified as either endpoints or infrastructure/excluded. It will assist with license renewal to pre-assign these queues to their appropriate classification, prior to
    downloading the usage report
  </div>
  <div class="mt-2" v-if="unassignedQueues.length">
    <QueueData :queues="unassignedQueues">
      <template #actions="{ queue }">
        <UnassignedQueueActions :queue="queue" :set-selected-queue="(queue: Queue) => (selectedQueue = queue)" />
      </template>
    </QueueData>
  </div>
  <NoData v-else message="There are currently no queues that remain unassigned"></NoData>

  <ModalDialog v-if="selectedQueue" id="endpoint-selection" :title="`Add ${selectedQueue.details.name} to:`" @close="selectedQueue = undefined">
    <template #modalBody>
      <div class="list-group">
        <button type="button" v-for="endpoint in endpoints" :key="endpoint.clientId" class="list-group-item list-group-item-action" @click="assignQueue(endpoint)">
          <span>{{ endpoint.name }}</span>
          <EndpointSelectionQueueDisplay :queues="endpoint.queues" />
        </button>
      </div>
    </template>
    <template #modalFooter="{ close }">
      <ActionButton aria-label="Close Endpoint Selection" @click="close">Cancel</ActionButton>
    </template>
  </ModalDialog>
</template>

<style scoped>
.list-group {
  max-height: 65vh;
  overflow: auto;

  --bs-list-group-active-bg: var(--particular-light);
  --bs-list-group-active-border-color: var(--particular-light);
}

.list-group-item {
  display: flex;
  justify-content: space-between;
}
</style>
