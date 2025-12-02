import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import type { SortInfo } from "@/components/SortInfo";
import Message, { MessageStatus } from "@/resources/Message";
import { EndpointsView } from "@/resources/EndpointView";
import type { DateRange } from "@/types/date";
import serviceControlClient from "@/components/serviceControlClient";

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

  const hasSuccessfulMessages = ref(false);

  async function checkForSuccessfulMessages() {
    try {
      // Fetch the latest 10 messages and check if any are successful
      // todo: ideally we would want to filter successful messages server-side, but the API doesn't currently support that
      const [, data] = await serviceControlClient.fetchTypedFromServiceControl<Message[]>(`messages2/?page_size=10&sort=time_sent&direction=desc`);
      hasSuccessfulMessages.value = data?.some((msg) => msg.status === MessageStatus.Successful) ?? false;
    } catch {
      hasSuccessfulMessages.value = false;
    }
  }

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
      const [fromDate, toDate] = dateRange.value;
      const from = fromDate?.toISOString() ?? "";
      const to = toDate?.toISOString() ?? "";
      const [response, data] = await serviceControlClient.fetchTypedFromServiceControl<Message[]>(
        `messages2/?endpoint_name=${selectedEndpointName.value}&from=${from}&to=${to}&q=${messageFilterString.value}&page_size=${itemsPerPage.value}&sort=${sortByInstances.value.property}&direction=${sortByInstances.value.isAscending ? "asc" : "desc"}`
      );
      totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
      messages.value = data;
    } catch (e) {
      messages.value = [];
      throw e;
    }
  }

  return {
    refresh,
    loadEndpoints,
    checkForSuccessfulMessages,
    sortBy: sortByInstances,
    messages,
    hasSuccessfulMessages,
    messageFilterString,
    selectedEndpointName,
    itemsPerPage,
    totalCount,
    endpoints,
    dateRange,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuditStore, import.meta.hot));
}

export type AuditStore = ReturnType<typeof useAuditStore>;
