<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import type * as CSS from "csstype";

defineProps<{ id: string; title: string; width?: CSS.Property.Width }>();
const emit = defineEmits<{ close: [] }>();

const ref = useTemplateRef("dialog");

function closeDialog() {
  emit("close");
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeDialog();
  }
}

onMounted(() => {
  document.body.className = "modal-open";
  document.addEventListener("keydown", onKeydown);
  /* native dialog showModal captures tab focus */
  const showModal = ref.value?.showModal;
  if (showModal) showModal();
});

onUnmounted(() => {
  document.body.className = "";
  document.removeEventListener("keydown", onKeydown);
  /* native dialog close releases tab focus */
  const close = ref.value?.close;
  if (close) close();
});
</script>

<template>
  <dialog class="modal-mask" ref="dialog" @click.self="closeDialog">
    <div class="modal-wrapper">
      <div :class="`modal-container ${id}-modal`" :style="{ width }" role="dialog" aria-modal="true" :aria-labelledby="`${id}-title`">
        <div class="modal-header">
          <div class="modal-title">
            <h3 :id="`${id}-title`">{{ title }}</h3>
            <button class="btn-close" aria-label="Close" @click="closeDialog" />
          </div>
        </div>
        <div class="modal-body">
          <slot name="modalBody"></slot>
        </div>
        <div class="modal-footer">
          <slot name="modalFooter" :close="closeDialog"></slot>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
@import "@/components/modal.css";

.modal-mask {
  /* overwrite dialog defaults */
  max-width: 100%;
  max-height: 100%;
}

.modal-container {
  max-width: 85vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
}

.modal-title {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.modal-footer {
  gap: 0.25rem;
  flex-shrink: 0;
}
</style>
