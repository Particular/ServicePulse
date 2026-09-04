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
const showPreview = ref(false);

function close() {
  emit("close");
}

function download() {
  downloadFileFromString(props.downloadJson, "application/json", "platform-health.json");
  hasDownloaded.value = true;
}

function togglePreview() {
  showPreview.value = !showPreview.value;
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
          <p>First download the platform health snapshot. Then open the support case and attach the downloaded file.</p>
          <ol>
            <li>Download or preview <code>platform-health.json</code>.</li>
            <li>Open the support case.</li>
            <li>Attach the downloaded file when raising the case.</li>
          </ol>
          <div v-if="showPreview" class="preview-panel">
            <h4 class="preview-title">Preview</h4>
            <pre class="preview-json" aria-label="Platform health JSON preview">{{ downloadJson }}</pre>
          </div>
        </div>
        <div class="modal-footer modal-actions">
          <ActionButton variant="primary" aria-label="Download platform health" @click="download">Download platform-health.json</ActionButton>
          <ActionButton :aria-label="showPreview ? 'Hide platform health preview' : 'Preview platform health'" @click="togglePreview">{{ showPreview ? "Hide preview" : "Preview platform-health.json" }}</ActionButton>
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

.preview-panel {
  margin-top: 1rem;
  border: 1px solid #dfe7e8;
  border-radius: 8px;
  background: #f9fbfb;
}

.preview-title {
  margin: 0;
  padding: 0.75rem 1rem 0;
  font-size: 14px;
}

.preview-json {
  margin: 0;
  padding: 0.75rem 1rem 1rem;
  max-height: 280px;
  overflow: auto;
  background: transparent;
  border: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.disabled {
  pointer-events: none;
  opacity: 0.65;
}
</style>
