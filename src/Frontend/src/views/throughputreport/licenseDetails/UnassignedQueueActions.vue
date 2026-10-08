<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import type { Queue } from "@/resources/LicenseDetails";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { faArrowRightToBracket, faCircleMinus, faCirclePlus, faGear } from "@fortawesome/free-solid-svg-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const props = defineProps<{ queue: Queue; additionalData: any }>();
const setSelectedQueue: (queue: Queue) => void = props.additionalData.setSelectedQueue;

const store = useLicenseDetailsStore();
const { excludeQueue, createEndpointFromQueue, markQueueAsInfrastructure } = store;

function exclude() {
  excludeQueue(props.queue);
}
function addToNew() {
  createEndpointFromQueue(props.queue);
}
function markAsInfrastructure() {
  markQueueAsInfrastructure(props.queue);
}
</script>

<template>
  <div class="input-group queue-controls">
    <button class="btn btn-secondary" type="button" v-tippy="'Not an endpoint queue (exclude)'" @click="exclude">
      <FAIcon :icon="faCircleMinus" />
    </button>

    <button class="btn btn-secondary" type="button" v-tippy="'Mark as Particular infrastructure'" @click="markAsInfrastructure"><FAIcon :icon="faGear" /></button>

    <button class="btn btn-secondary" type="button" v-tippy="'Create endpoint from queue'" @click="addToNew"><FAIcon :icon="faCirclePlus" /></button>

    <button class="btn btn-secondary" type="button" data-bs-toggle="modal" data-bs-target="#availableEndpoints" v-tippy="'Add queue to existing endpoint'" @click="setSelectedQueue(queue)">
      <FAIcon :icon="faArrowRightToBracket" />
    </button>
  </div>
</template>

<style scoped>
.queue-controls {
  display: block;
  width: max-content;
}
</style>
