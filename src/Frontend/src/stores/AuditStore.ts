import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import type { SortInfo } from "@/components/SortInfo";
import type Message from "@/resources/Message";
import type { EndpointsView } from "@/resources/EndpointView";
import type { DateRange } from "@/types/date";
import serviceControlClient from "@/components/serviceControlClient";
import auditClient from "@/components/audit/auditClient";

export enum FieldNames {
  TimeSent = "time_sent",
  ProcessingTime = "processing_time",
  CriticalTime = "critical_time",
  DeliveryTime = "delivery_time",
}

export const useAuditStore = defineStore("AuditStore", () => {
  const sortByInstances = ref<SortInfo>({
    property: FieldNames.TimeSent,
    isAscending: false,
  });

  const dateRange = ref<DateRange>([]);
  const messageFilterString = ref("");
  const itemsPerPage = ref(100);
  const totalCount = ref(0);
  const messages = ref<Message[]>([]);
  const selectedEndpointName = ref<string>("");
  const endpoints = ref<EndpointsView[]>([]);
  const queryFailed = ref(false);

  async function loadEndpoints() {
    try {
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<EndpointsView[]>(`endpoints`);
      endpoints.value = data;
    } catch (e) {
      endpoints.value = [];
      throw e;
    }
  }

  async function refresh() {
    try {
      const [response, data] = await auditClient.getMessages({
        endpointName: selectedEndpointName.value,
        dateRange: dateRange.value,
        messageFilterString: messageFilterString.value,
        itemsPerPage: itemsPerPage.value,
        sort: sortByInstances.value,
      });
      totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
      messages.value = data;
      queryFailed.value = false;
    } catch {
      // A long-running query is terminated by ServiceControl after its configured query time limit
      // and surfaces here as a failed response. Not rethrown: the callers are watchers, so a
      // rethrow would only become an unhandled rejection instead of user feedback.
      messages.value = [];
      totalCount.value = 0;
      queryFailed.value = true;
    }
  }

  return {
    refresh,
    loadEndpoints,
    sortBy: sortByInstances,
    messages,
    messageFilterString,
    selectedEndpointName,
    itemsPerPage,
    totalCount,
    endpoints,
    dateRange,
    queryFailed,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditStore, import.meta.hot));
}

export type AuditStore = ReturnType<typeof useAuditStore>;
