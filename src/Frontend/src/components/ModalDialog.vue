<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

defineProps<{ id: string; title: string; class?: string }>();
const emit = defineEmits<{ close: [] }>();

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
});

onUnmounted(() => {
  document.body.className = "";
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div class="modal-mask" @click.self="closeDialog">
    <div class="modal-wrapper">
      <div :class="`modal-container ${id}-modal`" role="dialog" aria-modal="true" :aria-labelledby="`${id}-title`">
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
  </div>
</template>

<style scoped>
@import "@/components/modal.css";

.modal-container {
  max-width: 85vw;
}

.modal-header {
  display: flex;
}

.modal-title {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.modal-footer {
  gap: 0.25rem;
}
</style>
