import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import { ConnectionState } from "@/resources/ConnectionState";
import { useCounter } from "@vueuse/core";
import monitoringClient from "@/components/monitoring/monitoringClient";
import serviceControlClient from "@/components/serviceControlClient";

export const useConnectionsAndStatsStore = defineStore("ConnectionsAndStatsStore", () => {
  const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;
  const failedMessageCount = ref(0);
  const archivedMessageCount = ref(0);
  const pendingRetriesMessageCount = ref(0);
  const disconnectedEndpointsCount = ref(0);

  const { count: requiresFullFailureDetailsSubscriberCount, inc, dec } = useCounter(0);
  function requiresFullFailureDetails() {
    onMounted(() => inc()); //NOTE: not forcing a refresh here since we expect the view utilising this store to also setup a refresh on mount
    onUnmounted(() => dec());
  }

  const connectionState = reactive<ConnectionState>({
    connected: false,
    connecting: false,
    connectedRecently: false,
    unableToConnect: null,
  });

  const monitoringConnectionState = reactive<ConnectionState>({
    connected: false,
    connecting: false,
    connectedRecently: false,
    unableToConnect: null,
  });

  const displayConnectionsWarning = computed(() => (connectionState.unableToConnect || (monitoringConnectionState.unableToConnect && isMonitoringEnabled)) ?? false);

  async function refresh() {
    const failedMessagesResult = getErrorMessagesCount(FailedMessageStatus.Unresolved);
    const archivedMessagesResult = requiresFullFailureDetailsSubscriberCount.value > 0 ? getErrorMessagesCount(FailedMessageStatus.Archived) : 0;
    const pendingRetriesResult = requiresFullFailureDetailsSubscriberCount.value > 0 ? getErrorMessagesCount(FailedMessageStatus.RetryIssued) : 0;
    const disconnectedEndpointsCountResult = getDisconnectedEndpointsCount();

    const [failedMessages, archivedMessages, pendingRetries, disconnectedEndpoints] = await Promise.all([failedMessagesResult, archivedMessagesResult, pendingRetriesResult, disconnectedEndpointsCountResult]);

    failedMessageCount.value = failedMessages;
    archivedMessageCount.value = archivedMessages;
    pendingRetriesMessageCount.value = pendingRetries;
    disconnectedEndpointsCount.value = disconnectedEndpoints;
  }

  function getErrorMessagesCount(status: FailedMessageStatus) {
    return fetchAndSetConnectionState(() => serviceControlClient.getErrorMessagesCount(status), connectionState);
  }

  function getDisconnectedEndpointsCount() {
    return fetchAndSetConnectionState(() => monitoringClient.getDisconnectedEndpointsCount(), monitoringConnectionState);
  }

  return {
    refresh,
    failedMessageCount,
    requiresFullFailureDetails,
    archivedMessageCount,
    pendingRetriesMessageCount,
    disconnectedEndpointsCount,
    connectionState,
    monitoringConnectionState,
    displayConnectionsWarning,
  };
});

async function fetchAndSetConnectionState(fetchFunction: () => Promise<number | undefined>, connectionState: ConnectionState) {
  if (connectionState.connecting) {
    //Skip the connection state checking
    const data = await fetchFunction();
    return data ?? 0;
  }

  try {
    if (!connectionState.connected) {
      connectionState.connecting = true;
      connectionState.connected = false;
    }

    try {
      const data = await fetchFunction();
      connectionState.unableToConnect = false;
      connectionState.connectedRecently = true;
      connectionState.connected = true;
      connectionState.connecting = false;

      return data ?? 0;
    } catch (err) {
      connectionState.connected = false;
      connectionState.unableToConnect = true;
      connectionState.connectedRecently = false;
      connectionState.connecting = false;
      console.log(err);
    }
  } catch {
    connectionState.connecting = false;
    connectionState.connected = false;
  }

  return 0;
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConnectionsAndStatsStore, import.meta.hot));
}

export type ConnectionsAndStatsStore = ReturnType<typeof useConnectionsAndStatsStore>;
