import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import { SagaHistory, SagaMessage } from "@/resources/SagaHistory";
import { useFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import Message from "@/resources/Message";

export interface SagaMessageData {
  message_id: string;
  data: string;
  type: "json" | "xml";
  error: boolean;
}
export const useSagaDiagramStore = defineStore("SagaDiagramStore", () => {
  const sagaHistory = ref<SagaHistory | null>(null);
  const sagaId = ref<string | null>(null);
  const loading = ref(false);
  const messageDataLoading = ref(false);
  const error = ref<string | null>(null);
  const showMessageData = ref(false);
  const fetchedMessages = ref(new Set<string>());
  const messagesData = ref<SagaMessageData[]>([]);
  const selectedMessageId = ref<string | null>(null);
  const scrollToTimeoutRequest = ref(false);
  const scrollToTimeout = ref(false);
  const MessageBodyEndpoint = "messages/{0}/body";

  // Get message store to watch for changes
  const messageStore = useMessageStore();

  // Watch for message_id changes in the MessageStore and update selectedMessageId
  watch(
    () => messageStore.state.data.message_id,
    (newMessageId) => {
      if (newMessageId) {
        setSelectedMessageId(newMessageId);
      }
    },
    { immediate: true }
  );

  // Watch the sagaId and fetch saga history when it changes
  watch(sagaId, async (newSagaId) => {
    if (newSagaId) {
      await fetchSagaHistory(newSagaId);
    } else {
      clearSagaHistory();
    }
  });

  // Watch both showMessageData and sagaHistory together
  watch([showMessageData, sagaHistory], async ([show, history]) => {
    if (show && history) {
      await fetchMessagesData(history);
    }
  });

  function setSagaId(id: string | null) {
    sagaId.value = id;
  }

  async function fetchSagaHistory(id: string) {
    if (!id) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await useFetchFromServiceControl(`sagas/${id}`);

      if (response.status === 404) {
        sagaHistory.value = null;
        error.value = "Saga history not found";
      } else if (!response.ok) {
        sagaHistory.value = null;
        error.value = "Failed to fetch saga history";
      } else {
        const data = await response.json();
        sagaHistory.value = data;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error occurred";
      sagaHistory.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSagaMessageData(message: SagaMessage): Promise<SagaMessageData> {
    const bodyUrl = (message.body_url ?? formatUrl(MessageBodyEndpoint, message.message_id)).replace(/^\//, "");

    try {
      const response = await useFetchFromServiceControl(bodyUrl, { cache: "no-store" });

      // Treat 404 as empty data, not as an error
      if (response.status === 404) {
        return {
          message_id: message.message_id,
          data: "",
          type: "json",
          error: false,
        };
      }

      // Handle other non-OK responses as errors
      if (!response.ok) {
        error.value = `HTTP error! status: ${response.status}`;
        return {
          message_id: message.message_id,
          data: "",
          type: "json",
          error: true,
        };
      }

      const body = await response.text();

      if (!body) {
        return {
          message_id: message.message_id,
          data: "",
          type: "json",
          error: false,
        };
      }

      // Determine the content type
      if (body.trim().startsWith("<?xml")) {
        return {
          message_id: message.message_id,
          data: body,
          type: "xml",
          error: false,
        };
      } else {
        return {
          message_id: message.message_id,
          data: body,
          type: "json",
          error: false,
        };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error occurred";
      return {
        message_id: message.message_id,
        data: "",
        type: "json",
        error: true,
      };
    }
  }

  async function getAuditMessages(sagaId: string) {
    try {
      const response = await useFetchFromServiceControl(`messages/search?q=${sagaId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching audit messages:", error);
      return { result: [] };
    }
  }

  function clearSagaHistory() {
    sagaHistory.value = null;
    sagaId.value = null;
    error.value = null;
    fetchedMessages.value.clear();
    messagesData.value = [];
    selectedMessageId.value = null;
    scrollToTimeoutRequest.value = false;
  }

  function formatUrl(template: string, id: string): string {
    return template.replace("{0}", id);
  }

  function toggleMessageData() {
    showMessageData.value = !showMessageData.value;
  }

  async function fetchMessagesData(history: SagaHistory) {
    messageDataLoading.value = true;
    error.value = null;

    try {
      // Get all messages from changes array - both initiating and outgoing
      const messagesToFetch = history.changes.flatMap((change) => {
        const messages: SagaMessage[] = [];

        // Add initiating message if it exists and hasn't been fetched
        if (change.initiating_message && !fetchedMessages.value.has(change.initiating_message.message_id)) {
          messages.push(change.initiating_message);
        }

        // Add all unfetched outgoing messages
        if (change.outgoing_messages) {
          messages.push(...change.outgoing_messages.filter((msg) => !fetchedMessages.value.has(msg.message_id)));
        }
        return messages;
      });

      // Check if any messages need body_url
      const needsBodyUrl = messagesToFetch.every((msg) => !msg.body_url);
      if (needsBodyUrl && messagesToFetch.length > 0) {
        const auditMessages = await getAuditMessages(sagaId.value!);
        messagesToFetch.forEach((message) => {
          const auditMessage = auditMessages.find((x: Message) => x.message_id === message.message_id);
          if (auditMessage) {
            message.body_url = auditMessage.body_url;
          }
        });
      }

      // Fetch data for each unfetched message in parallel and store results
      const fetchPromises = messagesToFetch.map(async (message) => {
        const data = await fetchSagaMessageData(message);
        fetchedMessages.value.add(message.message_id);
        return data;
      });

      const newMessageData = await Promise.all(fetchPromises);
      // Add new message data to the existing array
      messagesData.value = [...messagesData.value, ...newMessageData];
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error occurred";
    } finally {
      messageDataLoading.value = false;
    }
  }

  function setSelectedMessageId(messageId: string | null) {
    selectedMessageId.value = messageId;
  }

  return {
    sagaHistory,
    sagaId,
    loading,
    messageDataLoading,
    error,
    showMessageData,
    messagesData,
    selectedMessageId,
    scrollToTimeoutRequest,
    scrollToTimeout,
    setSagaId,
    clearSagaHistory,
    toggleMessageData,
    setSelectedMessageId,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSagaDiagramStore, import.meta.hot));
}

export type SagaDiagramStore = ReturnType<typeof useSagaDiagramStore>;
