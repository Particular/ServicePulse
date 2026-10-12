<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import type { Endpoint, Queue } from "@/resources/LicenseDetails.ts";
import EndpointSelectionQueueDisplay from "./EndpointSelectionQueueDisplay.vue";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{ queue: Queue }>();
const emit = defineEmits<{ close: [] }>();

const licenseDetailsStore = useLicenseDetailsStore();
const { addQueueToEndpoint } = licenseDetailsStore;
const { endpoints } = storeToRefs(licenseDetailsStore);

function closeDialog() {
  emit("close");
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeDialog();
  }
}

function assignQueue(endpoint: Endpoint) {
  addQueueToEndpoint(props.queue, endpoint);
  closeDialog();
}

onMounted(() => {
  document.body.className = "modal-open";
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.body.className = "";
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="modal-mask" @click.self="closeDialog">
    <div class="modal-wrapper">
      <div class="modal-container endpoint-selection-modal" role="dialog" aria-modal="true" aria-labelledby="endpoint-selection-title">
        <div class="modal-header">
          <div class="modal-title">
            <h3 id="endpoint-selection-title">Add {{ queue.details.name }} to:</h3>
          </div>
        </div>
        <div class="modal-body">
          <div class="list-group">
            <button type="button" v-for="endpoint in endpoints" :key="endpoint.clientId" class="list-group-item list-group-item-action" @click="assignQueue(endpoint)">
              <span>{{ endpoint.name }}</span>
              <EndpointSelectionQueueDisplay :queues="endpoint.queues" />
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <ActionButton aria-label="Close Endpoint Selection" @click="closeDialog">Cancel</ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/components/modal.css";

.endpoint-selection-modal {
  max-width: 85vw;
}

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

.text-bg-particular {
  background-color: var(--particular);
  color: white;
}
</style>
