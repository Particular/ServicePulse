import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
//import { SortDirection, type GroupPropertyType } from "@/resources/SortOptions";
import type { SortInfo } from "@/components/SortInfo";
import Message from "@/resources/Message";

export enum ColumnNames {
  Status = "status",
  MessageId = "messageId",
  MessageType = "messageType",
  TimeSent = "timeSent",
  ProcessingTime = "processingTime",
}

// const columnSortings = new Map<string, (endpoint: Message) => GroupPropertyType>([
//   // [ColumnNames.Name, (endpoint) => endpoint.name],
//   // [ColumnNames.InstancesDown, (endpoint) => endpoint.alive_count - endpoint.down_count],
//   // [ColumnNames.InstancesTotal, (endpoint) => endpoint.alive_count + endpoint.down_count],
//   // [ColumnNames.LastHeartbeat, (endpoint) => moment.utc(endpoint.heartbeat_information?.last_report_at ?? "1975-01-01T00:00:00")],
//   // [ColumnNames.Tracked, (endpoint) => endpoint.track_instances],
//   // [ColumnNames.TrackToggle, (endpoint) => endpoint.track_instances],
// ]);

export const useAuditStore = defineStore("AuditStore", () => {
  const sortByInstances = ref<SortInfo>({
    property: ColumnNames.MessageId,
    isAscending: true,
  });

  const messageFilterString = ref("");
  const itemsPerPage = ref(20);
  const selectedPage = ref(1);
  const totalCount = ref(0);
  const messages = ref<Message[]>([]);
  // const sortedMessages = computed<Message[]>(() =>
  //   [...messages.value].sort(getSortFunction(columnSortings.get(sortByInstances.value.property), sortByInstances.value.isAscending ? SortDirection.Ascending : SortDirection.Descending))
  // );
  // const filteredMessages = computed<Message[]>(() => sortedMessages.value.filter((message) => !messageFilterString.value || message.id.toLowerCase().includes(messageFilterString.value.toLowerCase())));
  watch(messageFilterString, (newValue) => {
    setMessageFilterString(newValue);
  });

  const dataRetriever = useAutoRefresh(async () => {
    try {
      const [response, data] = await useTypedFetchFromServiceControl<Message[]>(`messages/?include_system_messages=false&per_page=${itemsPerPage.value}&page=${selectedPage.value}`);
      totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
      messages.value = data;
    } catch (e) {
      messages.value = [];
      throw e;
    }
  }, null);

  const refresh = dataRetriever.executeAndResetTimer;
  watch(itemsPerPage, () => refresh());
  watch(selectedPage, () => refresh());

  function setMessageFilterString(filter: string) {
    messageFilterString.value = filter;
  }

  return {
    refresh,
    updateRefreshTimer: dataRetriever.updateTimeout,
    sortByInstances,
    messages,
    messageFilterString,
    itemsPerPage,
    selectedPage,
    totalCount,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditStore, import.meta.hot));
}

export type AuditStore = ReturnType<typeof useAuditStore>;
