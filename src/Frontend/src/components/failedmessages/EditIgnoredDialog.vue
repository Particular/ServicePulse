<script setup lang="ts">
import ModalDialog from "../ModalDialog.vue";
import ActionButton from "../ActionButton.vue";

const emit = defineEmits<{
  close: [];
}>();

function closeDialog() {
  emit("close");
}
</script>

<template>
  <ModalDialog id="edit-ignored" title="Edit Ignored" @close="closeDialog">
    <template #modalBody>
      <p>This retry was ignored because another edit had already been processed.</p>
    </template>
    <template #modalFooter>
      <ActionButton @click="closeDialog()">Ok</ActionButton>
    </template>
  </ModalDialog>
</template>
