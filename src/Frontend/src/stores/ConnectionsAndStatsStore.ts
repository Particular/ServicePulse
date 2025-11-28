import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { FailedMessageStatus } from "@/resources/FailedMessage";
import { ConnectionState } from "@/resources/ConnectionState";
import monitoringClient from "@/components/monitoring/monitoringClient";
import { useRecoverabilityStore } from "./RecoverabilityStore";

export const useConnectionsAndStatsStore = defineStore("ConnectionsAndStatsStore", () => {
  const isMonitoringEnabled = monitoringClient.isMonitoringEnabled;
  const failedMessageCount = ref(0);
  const disconnectedEndpointsCount = ref(0);
  const recoverabilityStore = useRecoverabilityStore();

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
    const disconnectedEndpointsCountResult = getDisconnectedEndpointsCount();

    const [failedMessages, disconnectedEndpoints] = await Promise.all([failedMessagesResult, disconnectedEndpointsCountResult]);

    failedMessageCount.value = failedMessages;
    disconnectedEndpointsCount.value = disconnectedEndpoints;
  }

  function getErrorMessagesCount(status: FailedMessageStatus) {
    return fetchAndSetConnectionState(() => recoverabilityStore.getErrorMessagesCount(status), connectionState);
  }

  function getDisconnectedEndpointsCount() {
    return fetchAndSetConnectionState(() => monitoringClient.getDisconnectedEndpointsCount(), monitoringConnectionState);
  }

  return {
    refresh,
    failedMessageCount,
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
