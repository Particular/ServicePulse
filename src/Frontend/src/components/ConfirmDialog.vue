<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import ModalDialog from "./ModalDialog.vue";
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits<{ confirm: []; cancel: [] }>();

withDefaults(
  defineProps<{
    heading: string;
    body: string;
    secondParagraph?: string;
    hideCancel?: boolean;
  }>(),
  { hideCancel: false, secondParagraph: "" }
);

function confirm() {
  emit("confirm");
}

function close() {
  emit("cancel");
}

onUnmounted(() => {
  // Must remove the class again once the modal is dismissed
  document.getElementsByTagName("body")[0].className = "";
});

onMounted(() => {
  // Add the `modal-open` class to the body tag
  document.getElementsByTagName("body")[0].className = "modal-open";
});
</script>

<template>
  <ModalDialog id="confirm" :title="heading" @close="close">
    <template #modalBody>
      <p>{{ body }}</p>
      <p v-if="secondParagraph && secondParagraph.length">{{ secondParagraph }}</p>
    </template>
    <template #modalFooter>
      <ActionButton variant="primary" :aria-label="hideCancel ? 'Ok' : 'Yes'" @click="confirm">{{ hideCancel ? "Ok" : "Yes" }}</ActionButton>
      <ActionButton v-if="!hideCancel" aria-label="No" @click="close">No</ActionButton>
    </template>
  </ModalDialog>
</template>
