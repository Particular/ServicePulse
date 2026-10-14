<script setup lang="ts">
import { ref } from "vue";
import ModalDialog from "../ModalDialog.vue";
import ActionButton from "../ActionButton.vue";

const emit = defineEmits(["createNoteConfirmed", "editNoteConfirmed", "cancelEditNote"]);

interface GroupComment {
  groupid: string;
  comment?: string;
}

const settings = defineProps<GroupComment>();
const grpcomment = ref(settings.comment);

function createNote() {
  const updatedGroup = {
    groupid: settings.groupid,
    comment: grpcomment.value,
  };
  emit("createNoteConfirmed", updatedGroup);
}

function editNote() {
  const updatedGroup = {
    groupid: settings.groupid,
    comment: grpcomment.value,
  };
  emit("editNoteConfirmed", updatedGroup);
}

function close() {
  emit("cancelEditNote");
}
</script>

<template>
  <ModalDialog id="failed-message-group-note" :title="settings.comment ? 'Modify Note' : 'Create Note'" @close="close">
    <template #modalBody>
      <div class="row">
        <div class="form-group">
          <label for="comment">Note</label>
          <textarea type="text" id="txtcomment" name="txtcomment" v-model.trim="grpcomment" placeholder="Comment" :minInputLength="1" class="form-control" required></textarea>
        </div>
      </div>
    </template>
    <template #modalFooter>
      <ActionButton v-if="settings.comment" :disabled="!grpcomment" variant="primary" @click="editNote">Modify</ActionButton>
      <ActionButton v-if="!settings.comment" :disabled="!grpcomment" variant="primary" @click="createNote">Create</ActionButton>
      <ActionButton @click="close">Cancel</ActionButton>
    </template>
  </ModalDialog>
</template>
