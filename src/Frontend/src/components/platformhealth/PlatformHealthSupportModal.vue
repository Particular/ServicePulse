<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import { downloadFileFromString } from "@/composables/fileDownloadCreator";
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  downloadJson: string;
  supportCaseUrl: string;
}>();

const emit = defineEmits<{ close: [] }>();
const hasDownloaded = ref(false);

function close() {
  emit("close");
}

function download() {
  downloadFileFromString(props.downloadJson, "application/json", "platform-configuration.json");
  hasDownloaded.value = true;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    close();
  }
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
  <div class="modal-mask" @click.self="close">
    <div class="modal-wrapper">
      <div class="modal-container platform-health-modal" role="dialog" aria-modal="true" aria-labelledby="platform-health-support-title">
        <div class="modal-header">
          <div class="modal-title">
            <h3 id="platform-health-support-title">Open support case</h3>
          </div>
        </div>
        <div class="modal-body">
          <p>First download the platform configuration. Then open the support case and attach the downloaded configuration file.</p>
          <ol>
            <li>Download <code>platform-configuration.json</code>.</li>
            <li>Open the support case.</li>
            <li>Attach the downloaded file when raising the case.</li>
          </ol>
        </div>
        <div class="modal-footer modal-actions">
          <ActionButton variant="primary" aria-label="Download platform configuration" @click="download">Download platform-configuration.json</ActionButton>
          <a :href="supportCaseUrl" class="btn btn-default" :class="{ disabled: !hasDownloaded }" target="_blank" rel="noreferrer" :aria-disabled="!hasDownloaded" :tabindex="hasDownloaded ? 0 : -1">Then open the support case</a>
          <ActionButton aria-label="Close support dialog" @click="close">Close</ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/components/modal.css";

.platform-health-modal {
  max-width: 560px;
}

.modal-body p {
  margin-bottom: 1rem;
}

.modal-body ol {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.disabled {
  pointer-events: none;
  opacity: 0.65;
}
</style>
