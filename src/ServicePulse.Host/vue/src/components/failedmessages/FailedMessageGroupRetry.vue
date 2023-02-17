<script setup>
const emit = defineEmits(["retryGroupConfirmed", "cancelRetryGroup"]);


const settings = defineProps({
       groupid: String,
        workflow_state: [],
    comment: String,
    messagecount: String,
});

function retryGroup() {
    emit("retryGroupConfirmed", settings);
}

function close() {
    emit("cancelRetryGroup");
}
</script>

<template>
  <div class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <h3>Are you sure you want to retry this group?</h3>
          </div>
        </div>
        <div class="modal-body">
            <p>
                Retrying a whole group can take some time and put extra load on your system.
                Are you sure you want to retry this group of {{settings.messagecount}} messages?
            </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="retryGroup">Yes</button>
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
