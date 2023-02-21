<script setup>
const emit = defineEmits(["deleteNoteConfirmed", "cancelDeleteNote"]);
const settings = defineProps({
  groupid: String,
  comment: String,
});

function deleteNote() {
  emit("deleteNoteConfirmed", settings.groupid);
}

function close() {
  emit("cancelDeleteNote");
}
</script>

<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <h3>Are you sure you want to delete this note?</h3>
          </div>
        </div>
        <div class="modal-body">
          <p>Deleted note will not be available.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="deleteNote">Yes</button>
          <button class="btn btn-default" @click="close">No</button>
        </div>
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
