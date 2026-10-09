<script setup lang="ts">
import FAIcon from "@/components/FAIcon.vue";
import type { Endpoint, Queue } from "@/resources/LicenseDetails";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const props = defineProps<{ queue: Queue; endpoint: Endpoint }>();

const store = useLicenseDetailsStore();
const { removeQueueFromEndpoint } = store;

function remove() {
  removeQueueFromEndpoint(props.queue, props.endpoint);
}
</script>

<template>
  <div class="input-group queue-controls">
    <button class="btn btn-secondary" type="button" v-tippy="`Return to Unassigned Queues`" @click="remove">
      <FAIcon :icon="faCircleXmark" />
    </button>
  </div>
</template>

<style scoped>
.queue-controls {
  display: block;
  width: max-content;
}
</style>
