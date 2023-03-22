<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRetryEditedMessage } from "../../composables/serviceFailedMessage";
import MessageHeader from "./EditMessageHeader.vue";

const emit = defineEmits(["cancel", "retried"]);

const settings = defineProps({
  id: String,
  message: Object,
  configuration: Object,
});

let panel = ref();
let message = ref();
let origMessageBody = undefined;

let showEditAndRetryConfirmation = ref(false);
let showCancelConfirmation = ref(false);
let showEditRetryGenericError = ref(false);

const id = computed(() => settings.id ?? message.value.id);
const messageBody = computed(() => settings.message.messageBody);

watch(messageBody, async (newValue) => {
  if (newValue !== origMessageBody) {
    message.value.isBodyChanged = true;
  }
  if (newValue === "") {
    message.value.isBodyEmpty = true;
  } else {
    message.value.isBodyEmpty = false;
  }
});

function close() {
  emit("cancel");
}

function confirmEditAndRetry() {
  showEditAndRetryConfirmation.value = true;
}

function confirmCancel() {
  if (message.value.isBodyChanged) {
    showCancelConfirmation.value = true;
    return;
  }

  if (message.value.headers.some((header) => header.isChanged)) {
    showCancelConfirmation.value = true;
    return;
  }

  close();
}

function resetBodyChanges() {
  message.value.messageBody = origMessageBody;
  message.value.isBodyChanged = false;
}

function findHeadersByKey(key) {
  return message.value.headers.find((header) => header.key === key);
}

function getContentType() {
  var header = findHeadersByKey("NServiceBus.ContentType");
  return header?.value;
}

function isContentTypeSupported(contentType) {
  return contentType === "application/json" || contentType === "text/xml";
}

function getMessageIntent() {
  var intent = findHeadersByKey("NServiceBus.MessageIntent");
  return intent?.value;
}

function removeHeadersMarkedAsRemoved() {
  message.value.headers.forEach((header, index, object) => {
    if (header.isMarkedAsRemoved) {
      object.splice(index, 1);
    }
  });
}

function retryEditedMessage() {
  removeHeadersMarkedAsRemoved();
  return useRetryEditedMessage([id.value], message)
    .then(() => {
      message.value.retried = true;
      return emit("retried", settings);
    })
    .catch(() => {
      showEditAndRetryConfirmation.value = false;
      showEditRetryGenericError.value = true;
      return;
    });
}

function initializeMessageBodyAndHeaders() {
  origMessageBody = settings.message.messageBody;
  message.value = settings.message;
  message.value.isBodyEmpty = false;
  message.value.isBodyChanged = false;

  var contentType = getContentType();
  message.value.bodyContentType = contentType;
  message.value.isContentTypeSupported = isContentTypeSupported(contentType);

  var messageIntent = getMessageIntent();
  message.value.isEvent = messageIntent.value === "Publish";

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

function togglePanel(panelNum) {
  panel.value = panelNum;
  return false;
}

onMounted(() => {
  togglePanel(1);
  initializeMessageBodyAndHeaders();
});
</script>

<template>
  <section name="failed_message_editor">
    <div class="model modal-msg-editor" style="z-index: 1050; display: block">
      <div class="modal-mask">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <div class="modal-title">
                <h3>Edit and retry message</h3>
              </div>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-sm-12">
                  <div class="row msg-editor-tabs">
                    <div class="col-sm-12 no-side-padding">
                      <div class="tabs msg-tabs">
                        <h5 :class="{ active: panel === 1 }" class="nav-item" @click="togglePanel(1)"><a href="javascript:void(0)">Headers</a></h5>
                        <h5 :class="{ active: panel === 2 }" class="nav-item" @click="togglePanel(2)"><a href="javascript:void(0)">Message body</a></h5>
                      </div>
                    </div>
                  </div>
                  <div class="row msg-editor-content">
                    <div class="col-sm-12 no-side-padding">
                      <div class="row alert alert-warning" v-if="message?.isEvent">
                        <div class="col-sm-12"><i class="fa fa-exclamation-circle"></i> This message is an event. If it was already successfully handled by other subscribers, editing it now has the risk of changing the semantic meaning of the event and may result in altering the system behavior.</div>
                      </div>
                      <div class="row alert alert-warning" v-if="!message?.isContentTypeSupported || message.bodyUnavailable">
                        <div class="col-sm-12"><i class="fa fa-exclamation-circle"></i> Message body cannot be edited because content type ({{ message?.bodyContentType }}) is not supported. Only messages with body content serialized as JSON or XML can be edited.</div>
                      </div>
                      <div class="row alert alert-danger" v-if="showEditRetryGenericError">
                        <div class="col-sm-12"><i class="fa fa-exclamation-triangle"></i> An error occurred while retrying the message, please check the ServiceControl logs for more details on the failure.</div>
                      </div>
                      <table class="table" v-if="panel === 1">
                        <tbody>
                          <tr class="interactiveList" v-for="(header, index) in message.headers" :key="index">
                            <MessageHeader :header="header"></MessageHeader>
                          </tr>
                        </tbody>
                      </table>
                      <div v-if="panel === 2 && !message.bodyUnavailable" style="height: calc(100% - 260px)">
                        <textarea class="form-control" :disabled="!message.isContentTypeSupported" v-model="message.messageBody"></textarea>
                        <span class="empty-error" v-if="message.isBodyEmpty"><i class="fa fa-exclamation-triangle"></i> Message body cannot be empty</span>
                        <span class="reset-body" v-if="message.isBodyChanged"><i class="fa fa-undo" uib-tooltip="Reset changes"></i> <a @click="resetBodyChanges()" href="javascript:void(0)">Reset changes</a></span>
                        <div class="alert alert-info" v-if="message.panel === 2 && message.bodyUnavailable">{{ message.bodyUnavailable }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer" v-if="!showEditAndRetryConfirmation && !showCancelConfirmation">
              <button class="btn btn-default" @click="confirmCancel()">Cancel</button>
              <button class="btn btn-primary" :disabled="message?.isBodyEmpty || message?.bodyUnavailable" @click="confirmEditAndRetry()">Retry</button>
            </div>
            <div class="modal-footer cancel-confirmation" v-if="showCancelConfirmation">
              <div>Are you sure you want to cancel? Any changes you made will be lost.</div>
              <button class="btn btn-default" @click="close()">Yes</button>
              <button class="btn btn-primary" @click="showCancelConfirmation = false">No</button>
            </div>
            <div class="modal-footer edit-retry-confirmation" v-if="showEditAndRetryConfirmation">
              <div>Are you sure you want to continue? If you edited the message, it may cause unexpected consequences in the system.</div>
              <button class="btn btn-default" @click="retryEditedMessage()">Yes</button>
              <button class="btn btn-primary" @click="showEditAndRetryConfirmation = false">No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style>
.cancel-confirmation,
.edit-retry-confirmation {
  background: #181919;
  color: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
}

.cancel-confirmation div,
.edit-retry-confirmation div {
  display: inline-block;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  top: 1px;
  margin-right: 20px;
}
</style>
