import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import { SagaHistory, SagaMessage } from "@/resources/SagaHistory";
import { useFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
// import { MessageStatus } from "@/resources/Message";

export interface SagaMessageDataItem {
  key: string;
  value: string;
}
export interface SagaMessageData {
  message_id: string;
  data: SagaMessageDataItem[];
}
export const useSagaDiagramStore = defineStore("sagaHistory", () => {
  const sagaHistory = ref<SagaHistory | null>(null);
  const sagaId = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const showMessageData = ref(false);
  const fetchedMessages = ref(new Set<string>());
  const messagesData = ref<SagaMessageData[]>([]);
  const MessageBodyEndpoint = "messages/{0}/body";

  // Watch for changes to sagaId and fetch saga history data
  watch(sagaId, async (newSagaId) => {
    if (!newSagaId) {
      sagaHistory.value = null;
      return;
    }

    await fetchSagaHistory(newSagaId);
  });

  // Watch for changes to showMessageData
  watch([showMessageData, sagaHistory], async ([show, history]) => {
    if (show && history) {
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

      // Fetch data for each unfetched message in parallel and store results
      const fetchPromises = messagesToFetch.map(async (message) => {
        const data = await fetchSagaMessageData(message);
        fetchedMessages.value.add(message.message_id);
        return data;
      });

      const newMessageData = await Promise.all(fetchPromises);
      // Add new message data to the existing array
      messagesData.value = [...messagesData.value, ...newMessageData];
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
    const bodyUrl = message.body_url ?? formatUrl(MessageBodyEndpoint, message.message_id);
    loading.value = true;
    error.value = null;
    // const headers = {
    //   "Cache-Control": message.message_status === MessageStatus.Successful ? "no-cache" : "no-cache",
    // };
    try {
      const response = await useFetchFromServiceControl(bodyUrl);
      const body = response;

      if (!body) {
        return {
          message_id: message.message_id,
          data: [],
        };
      }

      // if (typeof body === "string" && body.trim().startsWith("<?xml")) {
      //   // return getXmlData(body); // Implement XML parsing below
      // } else {
      //   // return processJsonValues(body); // Implement JSON property extraction
      // }

      // Return dummy data for now
      return {
        message_id: message.message_id,
        data: [
          { key: "Property1", value: "Test Value 1" },
          { key: "Property2", value: "Test Value 2" },
          { key: "Timestamp", value: new Date().toISOString() },
        ],
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Unknown error occurred";
      return {
        message_id: message.message_id,
        data: [],
      };
    } finally {
      loading.value = false;
    }
  }

  function clearSagaHistory() {
    sagaHistory.value = null;
    sagaId.value = null;
    error.value = null;
    fetchedMessages.value.clear();
    messagesData.value = [];
  }

  function formatUrl(template: string, id: string): string {
    return template.replace("{0}", id);
  }

  function toggleMessageData() {
    showMessageData.value = !showMessageData.value;
  }

  return {
    sagaHistory,
    sagaId,
    loading,
    error,
    showMessageData,
    messagesData,
    setSagaId,
    fetchSagaHistory,
    clearSagaHistory,
    toggleMessageData,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSagaDiagramStore, import.meta.hot));
}

export type SagaDiagramStore = ReturnType<typeof useSagaDiagramStore>;
