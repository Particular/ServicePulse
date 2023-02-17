<script setup>
const emit = defineEmits(["deleteGroupConfirmed", "cancelDeleteGroup"]);


const settings = defineProps({
       groupid: String,
        workflow_state: [],
        comment: String,
});

function deleteGroup() {
    emit("deleteGroupConfirmed", settings);
}

function close() {
    emit("cancelDeleteGroup");
}
</script>

<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <h3>Are you sure you want to delete this group?</h3>
          </div>
        </div>
        <div class="modal-body">
          <p>
            Messages that are deleted will be cleaned up according to the
            ServiceControl retention policy, and aren't available for retrying
            unless they're restored..
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="deleteGroup">Yes</button>
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
