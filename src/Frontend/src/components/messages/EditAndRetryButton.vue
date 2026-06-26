<script setup lang="ts">
import ActionButton from "@/components/ActionButton.vue";
import { useMessageStore } from "@/stores/MessageStore";
import { computed, ref } from "vue";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";
import EditRetryDialog from "@/components/failedmessages/EditRetryDialog.vue";
import EditIgnoredDialog from "@/components/failedmessages/EditIgnoredDialog.vue";
import { MessageStatus } from "@/resources/Message";
import { storeToRefs } from "pinia";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import PermissionGate from "@/components/PermissionGate.vue";

const store = useMessageStore();
const { state, edit_and_retry_config, editRetryResponse, canEdit } = storeToRefs(store);
const isConfirmDialogVisible = ref(false);
const isEditIgnoredDialogVisible = ref(false);

// Edit & retry is enabled by a ServiceControl setting (edit_and_retry_config). When it is on,
// the button is shown to everyone but disabled (with a tooltip) for users without the edit
// permission, rather than hidden.
const editDeniedTooltip = "You don't have permission to edit and retry messages.";

const failureStatus = computed(() => state.value.data.failure_status);
const isDisabled = computed(() => failureStatus.value.retried || failureStatus.value.archived || failureStatus.value.resolved);
const isVisible = computed(() => edit_and_retry_config.value.enabled && state.value.data.status !== MessageStatus.Successful && state.value.data.status !== MessageStatus.ResolvedSuccessfully);

const handleIgnoreClose = async () => {
  isEditIgnoredDialogVisible.value = false;
  await store.pollForNextUpdate(FailedMessageStatus.Resolved);
};

const handleConfirm = async () => {
  isConfirmDialogVisible.value = false;

  if (editRetryResponse.value?.edit_ignored) {
    isEditIgnoredDialogVisible.value = true;
  } else {
    const message = `Retrying the edited message ${state.value.data.id} ...`;
    useShowToast(TYPE.INFO, "Info", message);
    await store.pollForNextUpdate(FailedMessageStatus.Resolved);
  }
};

async function openDialog() {
  await store.downloadBody();
  isConfirmDialogVisible.value = true;
}
</script>

<template>
  <template v-if="isVisible">
    <PermissionGate :allowed="canEdit" :reason="editDeniedTooltip">
      <ActionButton :icon="faPencil" aria-label="Edit & retry" :disabled="isDisabled || !canEdit" @click="openDialog">Edit & retry</ActionButton>
    </PermissionGate>
    <Teleport to="#modalDisplay">
      <EditRetryDialog v-if="isConfirmDialogVisible" @cancel="isConfirmDialogVisible = false" @confirm="handleConfirm"></EditRetryDialog>
      <EditIgnoredDialog v-if="isEditIgnoredDialogVisible" @close="handleIgnoreClose"></EditIgnoredDialog>
    </Teleport>
  </template>
</template>
