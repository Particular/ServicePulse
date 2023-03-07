<script setup>
import { reactive, onMounted } from "vue";

const emit = defineEmits(["cancel"]);

const settings = defineProps({
  message: Object,
});

const panel = reactive({ number: undefined });

/* function retry() {
    emit("retry", settings);
} */

function close() {
  emit("cancel");
}

function togglePanel(panelNum) {
  panel.number = panelNum;
  return false;
}

onMounted(() => {
  togglePanel(1);
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
              <div class="row">
                <div isolate-click class="col-sm-12 no-side-padding">
                  <div class="nav tabs msg-tabs">
                    <h5 :class="{ active: panelFoo === 1 }" class="nav-item" @click="togglePanel(1)"><a href="#">Headers</a></h5>
                    <h5 :class="{ active: panelFoo === 2 }" class="nav-item" @click="togglePanel(2)"><a href="#">Message body</a></h5>
                  </div>
                  <!-- <pre isolate-click v-if="panel === 0">{{ failedMessage.exception?.message }}</pre>
                                <pre isolate-click v-if="panel === 1">{{ failedMessage.exception.stack_trace }}</pre> -->
                  <table isolate-click class="table" v-if="panel.number === 1">
                    <tbody>
                      <tr class="interactiveList" v-for="(header, index) in settings.message.headers" :key="index">
                        <td nowrap="nowrap">{{ header.key }}</td>
                        <td>
                          <pre>{{ header.value }}</pre>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <!-- <div isolate-click class="alert alert-info" v-if="panel === 2 && failedMessage.headersNotFound">Could not find message headers. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div> -->
                  <!-- <pre isolate-click v-if="panel === 3 && !failedMessage.messageBodyNotFound">{{ failedMessage.messageBody }}</pre> -->
                  <!-- <div isolate-click class="alert alert-info" v-if="panel === 3 && failedMessage.messageBodyNotFound">Could not find message body. This could be because the message URL is invalid or the corresponding message was processed and is no longer tracked by ServiceControl.</div> -->
                  <!-- <flow-diagram v-if="failedMessage.conversationId" conversation-id="{{failedMessage.conversationId}}" v-show="panel === 4"></flow-diagram> -->
                </div>
              </div>
              <pre isolate-click v-if="panel.number === 2">{{ settings.message.messageBody }}</pre>
            </div>
            <div class="modal-footer">
              <!-- <button class="btn btn-primary" @click="confirm">{{ hideCancel ? "Ok" : "Yes" }}</button> -->
              <button class="btn btn-default" @click="close">Cancel</button>
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
</style>
