<script setup>
import { ref } from "vue";
const emit = defineEmits(["create", "edit", "cancel"]);

const settings = defineProps({
  groupid: String,
  comment: String,
});
const grpcomment = ref(settings.comment);

function create() {
  var updatedGroup = {
    groupid: settings.groupid,
    comment: grpcomment.value,
  };
  emit("create", updatedGroup);
}

function edit() {
  var updatedGroup = {
    groupid: settings.groupid,
    comment: grpcomment.value,
  };
  emit("edit", updatedGroup);
}

function close() {
  emit("cancel");
}
</script>

<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title" v-if="settings.comment">Modify Note</h3>
          <h3 class="modal-title" v-if="!settings.comment">Create Note</h3>
        </div>

        <form name="commentNoteForm" novalidate @submit.prevent="save">
          <div class="modal-body">
            <div class="row">
              <div class="form-group">
                <label for="comment">Note</label>
                <textarea
                  type="text"
                  id="txtcomment"
                  name="txtcomment"
                  v-model="grpcomment"
                  placeholder="Comment"
                  class="form-control"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              v-if="settings.comment"
              class="btn btn-primary"
              @click="edit"
            >
              Modify
            </button>
            <button
              v-if="!settings.comment"
              class="btn btn-primary"
              @click="create"
            >
              Create
            </button>
            <button class="btn btn-default" @click="close">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 600px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
</style>
