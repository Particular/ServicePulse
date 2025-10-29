import { acceptHMRUpdate, defineStore, storeToRefs } from "pinia";
import { computed, reactive, Ref, ref, watch } from "vue";
import Header from "@/resources/Header";
import type EndpointDetails from "@/resources/EndpointDetails";
import { FailedMessage, ExceptionDetails, FailedMessageStatus } from "@/resources/FailedMessage";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import Message, { MessageStatus } from "@/resources/Message";
import moment from "moment/moment";
import { parse, stringify } from "lossless-json";
import xmlFormat from "xml-formatter";
import { DataContainer } from "./DataContainer";
import { useServiceControlStore } from "./ServiceControlStore";
import { EditAndRetryConfig } from "@/resources/Configuration";

interface Model {
  id?: string;
  message_id?: string;
  conversation_id?: string;
  message_type?: string;
  sending_endpoint?: EndpointDetails;
  receiving_endpoint?: EndpointDetails;
  body_url?: string;
  status?: MessageStatus;
  processed_at?: string;
  failure_status: Partial<{
    retried: boolean;
    archiving: boolean;
    restoring: boolean;
    archived: boolean;
    resolved: boolean;
    delete_soon: boolean;
    retry_in_progress: boolean;
    delete_in_progress: boolean;
    restore_in_progress: boolean;
    submitted_for_retrial: boolean;
  }>;
  failure_metadata: Partial<{
    exception: ExceptionDetails;
    number_of_processing_attempts: number;
    status: FailedMessageStatus;
    time_of_failure: string;
    last_modified: string;
    edited: boolean;
    edit_of: string;
    deleted_in: string;
    redirect: boolean;
  }>;
  dialog_status: Partial<{
    show_delete_confirm: boolean;
    show_restore_confirm: boolean;
    show_retry_confirm: boolean;
    show_edit_retry_modal: boolean;
  }>;
  invoked_saga: Partial<{
    has_saga: boolean;
    saga_id: string;
    saga_type: string;
  }>;
}

export const useMessageStore = defineStore("MessageStore", () => {
  const headers = ref<DataContainer<Header[]>>({ data: [] });
  const body = ref<DataContainer<{ value?: string; content_type?: string; no_content?: boolean }>>({ data: {} });
  const state = reactive<DataContainer<Model>>({ data: { failure_metadata: {}, failure_status: {}, dialog_status: {}, invoked_saga: {} } });
  const edit_and_retry_config = ref<EditAndRetryConfig>({ enabled: false, locked_headers: [], sensitive_headers: [] });
  const conversationData = ref<DataContainer<Message[]>>({ data: [] });

  let bodyLoadedId = "";
  let conversationLoadedId = "";

  const configStore = useConfigurationStore();
  const serviceControlStore = useServiceControlStore();
  const { serviceControlUrl } = storeToRefs(serviceControlStore);

  const { configuration } = storeToRefs(configStore);
  const error_retention_period = computed(() => moment.duration(configuration.value?.data_retention?.error_retention_period).asHours());

  watch(serviceControlUrl, loadConfig, { immediate: true });
  async function loadConfig() {
    if (!serviceControlUrl.value) return;
    const [, data] = await serviceControlStore.fetchTypedFromServiceControl<EditAndRetryConfig>("edit/config");
    edit_and_retry_config.value = data;
  }

  function reset() {
    state.data = { failure_metadata: {}, failure_status: {}, dialog_status: {}, invoked_saga: {} };
    headers.value.data = [];
    body.value.data = { value: "", content_type: "" };
    bodyLoadedId = "";
    conversationLoadedId = "";
    conversationData.value.data = [];
  }

  async function loadFailedMessage(id: string) {
    state.loading = true;
    state.failed_to_load = false;
    state.not_found = false;

    try {
      const response = await serviceControlStore.fetchFromServiceControl(`errors/last/${id}`);
      if (response.status === 404) {
        state.not_found = true;
        return;
      } else if (!response.ok) {
        state.failed_to_load = true;
        return;
      }

      const message = (await response.json()) as FailedMessage;
      state.data.message_id = message.message_id;
      state.data.message_type = message.message_type;
      state.data.sending_endpoint = message.sending_endpoint;
      state.data.receiving_endpoint = message.receiving_endpoint;
      state.data.failure_status.archived = message.status === FailedMessageStatus.Archived;
      state.data.failure_status.resolved = message.status === FailedMessageStatus.Resolved;
      state.data.failure_status.retried = message.status === FailedMessageStatus.RetryIssued;
      state.data.failure_metadata.last_modified = message.last_modified;
      state.data.failure_metadata.exception = message.exception;
      state.data.failure_metadata.time_of_failure = message.time_of_failure;
      state.data.failure_metadata.edited = message.edited;
      state.data.failure_metadata.edit_of = message.edit_of;
      state.data.failure_metadata.number_of_processing_attempts = message.number_of_processing_attempts;
      state.data.failure_metadata.status = message.status;

      await loadMessage(state.data.message_id, id);
    } catch {
      state.failed_to_load = true;
      return;
    } finally {
      state.loading = false;
    }

    const countdown = moment(state.data.failure_metadata.last_modified).add(error_retention_period.value, "hours");
    state.data.failure_status.delete_soon = countdown < moment();
    state.data.failure_metadata.deleted_in = countdown.format();
  }

  async function loadMessage(messageId: string, id: string) {
    state.data.id = id;
    state.loading = headers.value.loading = true;
    state.failed_to_load = headers.value.failed_to_load = false;
    state.not_found = headers.value.not_found = false;

    try {
      const [, data] = await serviceControlStore.fetchTypedFromServiceControl<Message[]>(`messages/search/${messageId}`);

      const message = data.find((value) => value.id === id);

      if (!message) {
        state.not_found = headers.value.not_found = true;
        return;
      }
      const invokedSaga = message?.invoked_sagas?.[0];
      state.data.message_id = message.message_id;
      state.data.conversation_id = message.conversation_id;
      state.data.body_url = message.body_url;
      state.data.message_type = message.message_type;
      state.data.sending_endpoint = message.sending_endpoint;
      state.data.receiving_endpoint = message.receiving_endpoint;
      state.data.status = message.status;
      state.data.processed_at = message.processed_at;
      if (invokedSaga) {
        state.data.invoked_saga.has_saga = true;
        state.data.invoked_saga.saga_id = invokedSaga.saga_id;
        state.data.invoked_saga.saga_type = invokedSaga.saga_type;
      }
      headers.value.data = message.headers;
    } catch {
      state.failed_to_load = headers.value.failed_to_load = true;
    } finally {
      state.loading = headers.value.loading = false;
    }
  }

  async function loadConversation(conversationId: string) {
    if (conversationId === conversationLoadedId) {
      return;
    }

    conversationLoadedId = conversationId;
    conversationData.value.loading = true;
    try {
      const [, data] = await serviceControlStore.fetchTypedFromServiceControl<Message[]>(`conversations/${conversationId}`);

      conversationData.value.data = data;
    } catch {
      conversationData.value.failed_to_load = true;
    } finally {
      conversationData.value.loading = false;
    }
  }

  async function downloadBody() {
    if (!state.data.body_url) {
      return;
    }
    if (state.data.id === bodyLoadedId) {
      return;
    }

    bodyLoadedId = state.data.id ?? "";
    body.value.loading = true;
    body.value.failed_to_load = false;

    try {
      const response = await serviceControlStore.fetchFromServiceControl(state.data.body_url.substring(1));
      if (response.status === 404) {
        body.value.not_found = true;

        return;
      }

      if (response.status === 204) {
        body.value.data.no_content = true;

        return;
      }

      const contentType = response.headers.get("content-type");
      body.value.data.content_type = contentType ?? "text/plain";
      body.value.data.value = await response.text();

      if (contentType === "application/json") {
        body.value.data.value = stringify(parse(body.value.data.value), null, 2) ?? body.value.data.value;
      }
      if (contentType === "text/xml") {
        body.value.data.value = xmlFormat(body.value.data.value, { indentation: "  ", collapseContent: true });
      }
    } catch {
      body.value.failed_to_load = true;
    } finally {
      body.value.loading = false;
    }
  }

  async function archiveMessage() {
    if (state.data.id) {
      const response = await serviceControlStore.patchToServiceControl("errors/archive/", [state.data.id]);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      state.data.failure_status.archiving = true;
    }
  }

  async function restoreMessage() {
    if (state.data.id) {
      const response = await serviceControlStore.patchToServiceControl("errors/unarchive/", [state.data.id]);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      state.data.failure_status.restoring = true;
    }
  }

  async function retryMessage() {
    if (state.data.id) {
      await retryMessages([state.data.id]);
      state.data.failure_status.retry_in_progress = true;
    }
  }

  async function retryMessages(ids: string[]) {
    const response = await serviceControlStore.postToServiceControl("errors/retry", ids);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
  }

  async function pollForNextUpdate(status: FailedMessageStatus) {
    if (!state.data.id) {
      return;
    }

    let maxRetries = 60; // We try for 60 seconds

    do {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // eslint-disable-next-line no-await-in-loop
      const [, data] = await serviceControlStore.fetchTypedFromServiceControl<FailedMessage>(`errors/last/${state.data.id}`);
      if (status === data.status) {
        break;
      }
    } while (maxRetries-- > 0);

    if (maxRetries === 0) {
      // It never changed so no need to refresh UI
      return;
    }

    const id = state.data.id;
    reset();
    await loadFailedMessage(id);
  }

  async function exportMessage() {
    if (state.failed_to_load || state.not_found) {
      return "";
    }

    let exportString = "";
    if (state.data.failure_metadata.exception?.stack_trace !== undefined) {
      exportString += "STACKTRACE\n";
      exportString += state.data.failure_metadata.exception.stack_trace;
      exportString += "\n\n";
    }

    exportString += "HEADERS";
    for (let i = 0; i < headers.value.data.length; i++) {
      exportString += `\n${headers.value.data[i].key}: ${headers.value.data[i].value}`;
    }

    await downloadBody();

    if (!(body.value.not_found || body.value.failed_to_load || body.value.data.no_content)) {
      exportString += "\n\nMESSAGE BODY\n";
      exportString += body.value.data.value;
    }

    return exportString;
  }

  return {
    headers,
    body,
    state,
    edit_and_retry_config,
    reset,
    loadMessage,
    loadFailedMessage,
    loadConversation,
    downloadBody,
    exportMessage,
    archiveMessage,
    restoreMessage,
    retryMessage,
    retryMessages,
    conversationData,
    pollForNextUpdate,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMessageStore, import.meta.hot));
}

export type MessageStore = ReturnType<typeof useMessageStore>;
