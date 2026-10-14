<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import MessageHeader from "./EditMessageHeader.vue";
import type Header from "@/resources/Header";
import parseContentType from "@/composables/contentTypeParser";
import type { CodeLanguage } from "@/components/codeEditorTypes";
import CodeEditor from "@/components/CodeEditor.vue";
import { useMessageStore } from "@/stores/MessageStore";
import { storeToRefs } from "pinia";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import FAIcon from "@/components/FAIcon.vue";
import { faExclamationCircle, faExclamationTriangle, faUndo } from "@fortawesome/free-solid-svg-icons";
import type { HeaderWithEditing } from "@/resources/EditMessage";
import { useDebounceFn } from "@vueuse/core";
import ModalDialog from "../ModalDialog.vue";
import ActionButton from "../ActionButton.vue";

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

interface LocalMessageState {
  isBodyChanged: boolean;
  isBodyEmpty: boolean;
  isContentTypeSupported: boolean;
  language?: CodeLanguage;
  bodyContentType: string | undefined;
  bodyUnavailable: boolean;
  isEvent: boolean;
  retried: boolean;
  headers: HeaderWithEditing[];
  messageBody: string;
}

const panel = ref(0);
const localMessage = ref<LocalMessageState>({
  isBodyChanged: false,
  isBodyEmpty: false,
  isContentTypeSupported: false,
  bodyContentType: undefined,
  bodyUnavailable: false,
  isEvent: false,
  retried: false,
  headers: [],
  messageBody: "",
});
const showEditAndRetryConfirmation = ref(false);
const showCancelConfirmation = ref(false);
const showEditRetryGenericError = ref(false);
const messageStore = useMessageStore();
const { state, headers, body, edit_and_retry_config } = storeToRefs(messageStore);

const id = computed(() => state.value.data.id ?? "");
const uneditedMessageBody = computed(() => body.value.data.value ?? "");
const regExToPruneLineEndings = new RegExp(/[\n\r]*/, "g");
const debounceBodyUpdate = useDebounceFn((value: string) => {
  const newValue = value.replaceAll(regExToPruneLineEndings, "");
  localMessage.value.isBodyChanged = newValue !== uneditedMessageBody.value.replaceAll(regExToPruneLineEndings, "");
  localMessage.value.isBodyEmpty = newValue === "";
}, 100);

watch(
  () => localMessage.value.messageBody,
  (newValue) => {
    debounceBodyUpdate(newValue);
  }
);

function close() {
  emit("cancel");
}

function confirmEditAndRetry() {
  showEditAndRetryConfirmation.value = true;
}

function confirmCancel() {
  if (localMessage.value.isBodyChanged) {
    showCancelConfirmation.value = true;
    return;
  }

  if (localMessage.value.headers.some((header: HeaderWithEditing) => header.isChanged)) {
    showCancelConfirmation.value = true;
    return;
  }

  close();
}

function resetBodyChanges() {
  localMessage.value.messageBody = uneditedMessageBody.value;
  localMessage.value.isBodyChanged = false;
}

function removeHeadersMarkedAsRemoved() {
  localMessage.value.headers = localMessage.value.headers.filter((header: HeaderWithEditing) => !header.isMarkedAsRemoved);
}

async function retryEditedMessage() {
  removeHeadersMarkedAsRemoved();
  try {
    await messageStore.retryEditedMessage(id.value, localMessage);
    localMessage.value.retried = true;
    return emit("confirm");
  } catch {
    showEditAndRetryConfirmation.value = false;
    showEditRetryGenericError.value = true;
  }
}

function initializeMessageBodyAndHeaders() {
  function getHeaderValue(key: string) {
    const header = local.headers.find((header: HeaderWithEditing) => header.key === key);
    return header?.value;
  }

  const local = <LocalMessageState>{
    isBodyChanged: false,
    isBodyEmpty: false,
    isContentTypeSupported: false,
    bodyContentType: undefined,
    bodyUnavailable: body.value.not_found ?? false,
    isEvent: false,
    retried: state.value.data.failure_status.retried ?? false,
    headers: headers.value.data.map((header: Header) => ({ ...header })) as HeaderWithEditing[],
    messageBody: body.value.data.value ?? "",
  };

  const contentType = getHeaderValue("NServiceBus.ContentType");
  local.bodyContentType = contentType;
  const parsedContentType = parseContentType(contentType);
  local.isContentTypeSupported = parsedContentType.isSupported;
  local.language = parsedContentType.language;

  const messageIntent = getHeaderValue("NServiceBus.MessageIntent");
  local.isEvent = messageIntent === "Publish";

  for (let index = 0; index < headers.value.data.length; index++) {
    const header: HeaderWithEditing = headers.value.data[index] as HeaderWithEditing;

    header.isLocked = false;
    header.isSensitive = false;
    header.isMarkedAsRemoved = false;
    header.isChanged = false;

    if (edit_and_retry_config.value.locked_headers.includes(header.key)) {
      header.isLocked = true;
    } else if (edit_and_retry_config.value.sensitive_headers.includes(header.key)) {
      header.isSensitive = true;
    }

    local.headers[index] = header;
  }

  localMessage.value = local;
}

function togglePanel(panelNum: number) {
  panel.value = panelNum;
}

function attemptClose() {
  if (!showEditAndRetryConfirmation.value && !showCancelConfirmation.value) confirmCancel();
  else if (showCancelConfirmation.value) showCancelConfirmation.value = false;
  else if (showEditAndRetryConfirmation.value) showEditAndRetryConfirmation.value = false;
}

onMounted(async () => {
  await messageStore.ensureEditAndRetryConfigurationLoaded();
  togglePanel(1);
  initializeMessageBodyAndHeaders();
});
</script>

<template>
  <ModalDialog id="failed-message-editor" title="Edit and retry message" @close="attemptClose" width="70%">
    <template #modalBody>
      <div class="row modal-msg-editor" role="dialog" aria-label="edit and retry message">
        <div class="msg-editor-tabs full-width">
          <div class="row msg-editor-tabs-header full-width">
            <div class="full-width no-side-padding">
              <div role="tablist" class="tabs msg-tabs">
                <h5 role="tab" :class="{ active: panel === 1 }" class="nav-item" @click.prevent="togglePanel(1)"><a href="#">Headers</a></h5>
                <h5 role="tab" :class="{ active: panel === 2 }" class="nav-item" @click.prevent="togglePanel(2)"><a href="#">Message body</a></h5>
              </div>
            </div>
          </div>
          <div class="row msg-editor-content full-width">
            <div class="full-width">
              <div class="alert alert-warning" v-if="localMessage.isEvent">
                <div class="col-sm-12">
                  <FAIcon :icon="faExclamationCircle" /> This message is an event. If it was already successfully handled by other subscribers, editing it now has the risk of changing the semantic meaning of the event and may result in altering the
                  system behavior.
                </div>
              </div>
              <div class="alert alert-warning" v-if="!localMessage.isContentTypeSupported || localMessage.bodyUnavailable">
                <div role="status" aria-label="cannot edit message body" class="col-sm-12">
                  <FAIcon :icon="faExclamationCircle" /> Message body cannot be edited because content type "{{ localMessage.bodyContentType }}" is not supported. Only messages with content types "application/json" and "text/xml" can be edited.
                </div>
              </div>
              <div class="alert alert-danger" v-if="showEditRetryGenericError">
                <div class="col-sm-12"><FAIcon :icon="faExclamationTriangle" class="error" /> An error occurred while retrying the message, please check the ServiceControl logs for more details on the failure.</div>
              </div>
              <table role="tabpanel" class="table" v-if="panel === 1">
                <tbody>
                  <tr class="interactiveList" v-for="header in localMessage.headers" :key="header.key">
                    <MessageHeader :header="header"></MessageHeader>
                  </tr>
                </tbody>
              </table>
              <template v-if="panel === 2">
                <div role="tabpanel" v-if="!localMessage.bodyUnavailable">
                  <div style="margin-top: 1.25rem">
                    <LoadingSpinner v-if="body.loading" />
                    <CodeEditor v-else aria-label="message body" :read-only="!localMessage.isContentTypeSupported" v-model="localMessage.messageBody" :language="localMessage.language" :show-gutter="true">
                      <template #toolbarLeft>
                        <span class="empty-error" v-if="localMessage.isBodyEmpty"><FAIcon :icon="faExclamationTriangle" class="error" /> Message body cannot be empty</span>
                      </template>
                      <template #toolbarRight>
                        <button v-if="localMessage.isBodyChanged" type="button" class="btn btn-secondary btn-sm" @click="resetBodyChanges"><FAIcon :icon="faUndo" /> Reset changes</button>
                      </template>
                    </CodeEditor>
                  </div>
                </div>
                <div role="tabpanel" class="alert alert-info" v-else>{{ localMessage.bodyUnavailable }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #modalFooter>
      <template v-if="!showEditAndRetryConfirmation && !showCancelConfirmation">
        <ActionButton @click="confirmCancel()">Cancel</ActionButton>
        <ActionButton variant="primary" :disabled="localMessage.isBodyEmpty || localMessage.bodyUnavailable" @click="confirmEditAndRetry()">Retry</ActionButton>
      </template>
      <div class="modal-footer cancel-confirmation" v-else-if="showCancelConfirmation">
        <span>Are you sure you want to cancel? Any changes you made will be lost.</span>
        <div>
          <ActionButton @click="close()">Yes</ActionButton>
          <ActionButton variant="primary" @click="showCancelConfirmation = false">No</ActionButton>
        </div>
      </div>
      <div class="modal-footer edit-retry-confirmation" v-else-if="showEditAndRetryConfirmation">
        <span>Are you sure you want to continue? If you edited the message, it may cause unexpected consequences in the system.</span>
        <div>
          <ActionButton @click="retryEditedMessage()">Yes</ActionButton>
          <ActionButton variant="primary" @click="showEditAndRetryConfirmation = false">No</ActionButton>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<style scoped>
.cancel-confirmation,
.edit-retry-confirmation {
  background: #181919;
  color: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  flex-basis: 100%;
  justify-content: space-between;
  padding: 0.25rem 0.5rem;
}

.cancel-confirmation div,
.edit-retry-confirmation div {
  display: flex;
  gap: 0.25rem;
}

.cancel-confirmation span,
.edit-retry-confirmation span {
  display: inline-block;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  top: 1px;
}

.modal-msg-editor .reset-body a:hover {
  cursor: pointer;
}

.modal-msg-editor .empty-error {
  color: #ce4844;
  font-weight: bold;
}

.modal-msg-editor .empty-error .error {
  color: #ce4844;
}

.modal-msg-editor .row.alert.alert-danger .error {
  color: #ce4844;
}

.modal-msg-editor .msg-editor-tabs {
  position: relative;
}

.modal-msg-editor .full-width {
  width: 100%;
}

.modal-msg-editor .msg-tabs {
  margin-top: 20px;
}

.modal-msg-editor .row.msg-editor-tabs-header {
  height: 52px;
  position: sticky;
  top: -15px;
  left: 0; /* TODO: horizonal scroll sticky isn't working */
  background: #fff;
  box-shadow: -10px 20px 20px #fff;
  z-index: 10;
}

.modal-msg-editor .row.msg-editor-content table {
  margin-top: 20px;
}

.modal-msg-editor .row {
  height: 100%;
}

.modal-msg-editor .row.msg-editor-content {
  padding-right: 15px;
}
</style>
