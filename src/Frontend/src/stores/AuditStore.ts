import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import type { SortInfo } from "@/components/SortInfo";
import type Message from "@/resources/Message";
import type { EndpointsView } from "@/resources/EndpointView";
import type { DateRange } from "@/types/date";
import serviceControlClient from "@/components/serviceControlClient";
import auditClient from "@/components/audit/auditClient";
import { loadDefaultRange, resolveTimeRange } from "@/components/audit/timeRange";
import { clearSearchHistory, loadSearchHistory, recordSearch } from "@/components/audit/searchHistory";
import { incompleteResultsHeader, parseIncompleteResults, type IncompleteInstance } from "@/components/incompleteResults";
import { HttpError } from "@/utils/HttpError";

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

  // Text expressions (relative like "now-6h" or absolute RFC 3339); resolved to
  // instants on every refresh so live ranges slide with auto-refresh
  const initialRange = loadDefaultRange();
  const timeRangeFrom = ref(initialRange.from);
  const timeRangeTo = ref(initialRange.to);
  const messageFilterString = ref("");
  const itemsPerPage = ref(100);
  const totalCount = ref(0);
  const messages = ref<Message[]>([]);
  const selectedEndpointName = ref<string>("");
  const endpoints = ref<EndpointsView[]>([]);
  const queryFailed = ref(false);
  // The failure was the server's query time limit (a 504), not a generic error
  const queryTimedOut = ref(false);
  // Instances whose data the current results are missing (partial 200 response)
  const incompleteInstances = ref<IncompleteInstance[]>([]);
  // Epoch ms of the in-flight query's start (null when idle) and the duration
  // of the query that produced the current results
  const queryStartedAt = ref<number | null>(null);
  const queryDurationMs = ref<number | null>(null);
  const queryCompletedAt = ref<string | null>(null);
  const searchHistory = ref(loadSearchHistory());
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

    const resolvedRange = resolveTimeRange({ from: timeRangeFrom.value, to: timeRangeTo.value });
    const dateRange: DateRange = resolvedRange ? [resolvedRange.from, resolvedRange.to] : [];

    const started = performance.now();
    queryStartedAt.value = Date.now();

    if (messageFilterString.value.trim() !== "" || selectedEndpointName.value.trim() !== "") {
      searchHistory.value = recordSearch(messageFilterString.value, selectedEndpointName.value, { from: timeRangeFrom.value, to: timeRangeTo.value });
    }

    try {
      const [response, data] = await auditClient.getMessages(
        {
          endpointName: selectedEndpointName.value,
          dateRange,
          messageFilterString: messageFilterString.value,
          itemsPerPage: itemsPerPage.value,
          sort: sortByInstances.value,
        },
        thisQuery.signal
      );

      if (activeQuery !== thisQuery) {
        // a newer query took over the view state while this one was in flight
        return;
      }

      totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
      messages.value = data;
      incompleteInstances.value = parseIncompleteResults(response.headers.get(incompleteResultsHeader));
      queryFailed.value = false;
      queryTimedOut.value = false;
      queryDurationMs.value = Math.round(performance.now() - started);
      queryCompletedAt.value = new Date().toISOString();
    } catch (error) {
      if (thisQuery.signal.aborted) {
        // Superseded by a newer query, or the view was left
        return;
      }

      // A long-running query is terminated by ServiceControl after its configured query time limit
      // and surfaces here as a 504. Not rethrown: the callers are watchers, so a rethrow would
      // only become an unhandled rejection instead of user feedback.
      messages.value = [];
      totalCount.value = 0;
      incompleteInstances.value = [];
      queryFailed.value = true;
      queryTimedOut.value = error instanceof HttpError && error.status === 504;
    } finally {
      if (activeQuery === thisQuery) {
        activeQuery = null;
        queryStartedAt.value = null;
      }
    }
  }

  // Stops the in-flight query, e.g. when the view showing the results is left.
  // The abort propagates through the ServiceControl API and terminates the
  // database query, so a backgrounded view does not keep load on the server.
  function clearHistory() {
    searchHistory.value = clearSearchHistory();
  }

  function cancelQuery() {
    activeQuery?.abort();
    activeQuery = null;
    queryStartedAt.value = null;
  }

  return {
    refresh,
    cancelQuery,
    loadEndpoints,
    sortBy: sortByInstances,
    messages,
    messageFilterString,
    selectedEndpointName,
    itemsPerPage,
    totalCount,
    endpoints,
    timeRangeFrom,
    timeRangeTo,
    queryFailed,
    queryTimedOut,
    incompleteInstances,
    queryStartedAt,
    queryDurationMs,
    queryCompletedAt,
    searchHistory,
    clearSearchHistory: clearHistory,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditStore, import.meta.hot));
}

export type AuditStore = ReturnType<typeof useAuditStore>;
