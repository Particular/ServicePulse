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
  let activeQuery: AbortController | null = null;

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
    // A refresh always represents the latest query the user asked for, so any query still in
    // flight is stale: abort it (which also terminates it on the ServiceControl side) and let
    // this one own the view state.
    activeQuery?.abort();
    const thisQuery = new AbortController();
    activeQuery = thisQuery;

    try {
      const [response, data] = await auditClient.getMessages(
        {
          endpointName: selectedEndpointName.value,
          dateRange: dateRange.value,
          messageFilterString: messageFilterString.value,
          itemsPerPage: itemsPerPage.value,
          sort: sortByInstances.value,
        },
        thisQuery.signal
      );

      if (activeQuery !== thisQuery) {
        return;
      }

      totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
      messages.value = data;
      queryFailed.value = false;
    } catch {
      if (thisQuery.signal.aborted) {
        // Superseded by a newer query, which owns the view state from here on
        return;
      }

      // A long-running query is terminated by ServiceControl after its configured query time limit
      // and surfaces here as a failed response. Not rethrown: the callers are watchers, so a
      // rethrow would only become an unhandled rejection instead of user feedback.
      messages.value = [];
      totalCount.value = 0;
      queryFailed.value = true;
    } finally {
      if (activeQuery === thisQuery) {
        activeQuery = null;
      }
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
