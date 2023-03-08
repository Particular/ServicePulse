<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["cancel", "retry"]);

const settings = defineProps({
  message: Object,
  configuration: Object,
});

let panel = ref();
let message = ref();

function initializeMessageHeaders() {
  message.value = settings.message;
  settings.message.headers.forEach((header, index) => {
    header.isLocked = false;
    header.isSensitive = false;
    header.isMarkedAsRemoved = false;
    header.isChanged = false;

    if (settings.configuration.locked_headers.includes(header.key)) {
      header.isLocked = true;
    } else if (settings.configuration.sensitive_headers.includes(header.key)) {
      header.isSensitive = true;
    }

    message.value.headers[index] = header;
  });
}

function close() {
  emit("cancel");
}

function retry() {
  emit("retry", settings);
}

function togglePanel(panelNum) {
  panel.value = panelNum;
  return false;
}

onMounted(() => {
  togglePanel(1);
  initializeMessageHeaders();
});
</script>

<template>
  <div class="container">
    <section name="failed_message">
      <div class="modal-mask">
        <div class="modal-content">
          <div class="modal-container">
            <div class="modal-header">
              <div class="modal-title">
                <h3>Edit and retry message</h3>
              </div>
            </div>
            <div class="modal-body">
              <div class="row msg-editor-content">
                <div class="col-sm-12 no-side-padding">
                  <div class="nav tabs msg-tabs">
                    <h5 :class="{ active: panel === 1 }" class="nav-item" @click="togglePanel(1)"><a href="#">Headers</a></h5>
                    <h5 :class="{ active: panel === 2 }" class="nav-item" @click="togglePanel(2)"><a href="#">Message body</a></h5>
                  </div>
                  <table class="table" v-if="panel === 1">
                    <tbody>
                      <tr class="interactiveList" v-for="(header, index) in message.headers" :key="index">
                        <td nowrap="nowrap">
                          {{ header.key }}
                          &nbsp;
                          <i class="fa fa-lock" tooltip="Protected system header" v-if="header.isLocked"></i>
                        </td>
                        <td>
                          <input class="form-control" :disabled="settings.configuration.locked_headers.includes(header.key)" v-model="header.value" />
                        </td>
                        <td>
                          <a v-if="!settings.configuration.locked_headers.includes(header.key)" href="#">
                            <i class="fa fa-trash" tooltip="Protected system header"></i>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <pre v-if="panel === 2">{{ settings.message.messageBody }}</pre>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" @click="close()">Cancel</button>
              <button class="btn btn-primary" @click="retry()">Retry</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.modal-container {
  width: 70%;
}
.modal-body {
  overflow-y: scroll;
  height: 80vh;
}
.msg-editor-content tr td:first-child {
  padding-top: 15px;
  padding-left: 0;
  width: 30%;
}
</style>
