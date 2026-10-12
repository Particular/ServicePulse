<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import type { Endpoint } from "@/resources/LicenseDetails.ts";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{ endpoint: Endpoint }>();
const emit = defineEmits<{ close: [] }>();

const licenseDetailsStore = useLicenseDetailsStore();

function closeDialog() {
  emit("close");
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeDialog();
  }
}

function removeEndpoint() {
  licenseDetailsStore.removeEndpoint(props.endpoint);
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
      <div class="modal-container remove-endpoint-modal" role="dialog" aria-modal="true" aria-labelledby="remove-endpoint-title">
        <div class="modal-header">
          <div class="modal-title">
            <h3 id="remove-endpoint-title">Remove Endpoint</h3>
          </div>
        </div>
        <div class="modal-body">
          <span>Please confirm removing Endpoint: {{ endpoint.name }}</span>
          <div class="mt-3 title">{{ endpoint.queues.length }} queues will be assigned to Unassigned Queues.</div>
        </div>
        <div class="modal-footer modal-actions">
          <ActionButton aria-label="Confirm Remove Endpoint" variant="primary" @click="removeEndpoint">Remove</ActionButton>
          <ActionButton aria-label="Close Remove Endpoint Dialog" @click="closeDialog">Cancel</ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/components/modal.css";
</style>
