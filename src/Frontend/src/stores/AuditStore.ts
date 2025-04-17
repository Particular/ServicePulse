import { useTypedFetchFromServiceControl } from "@/composables/serviceServiceControlUrls";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import useAutoRefresh from "@/composables/autoRefresh";
import type { SortInfo } from "@/components/SortInfo";
import Message from "@/resources/Message";
import { EndpointsView } from "@/resources/EndpointView.ts";

export const useAuditStore = defineStore("AuditStore", () => {
  const sortByInstances = ref<SortInfo>({
    property: "time_sent",
    isAscending: false,
  });

  const dateRange = ref<Date[]>([]);
  const messageFilterString = ref("");
  const itemsPerPage = ref(100);
  const totalCount = ref(0);
  const messages = ref<Message[]>([]);
  const selectedEndpointName = ref<string>("");
  const endpoints = ref<EndpointsView[]>([]);

  useAutoRefresh(
    async () => {
      try {
        const [, data] = await useTypedFetchFromServiceControl<EndpointsView[]>(`endpoints`);
        endpoints.value = data;
      } catch (e) {
        endpoints.value = [];
        throw e;
      }
    },
    30000,
    true
  );

  const dataRetriever = useAutoRefresh(
    async () => {
      try {
        let from = "",
          to = "";
        if (dateRange.value.length === 2) {
          from = dateRange.value[0].toISOString();
          to = dateRange.value[1].toISOString();
        }
        console.log("retrieveing messages2");
        const [response, data] = await useTypedFetchFromServiceControl<Message[]>(
          `messages2/?endpoint_name=${selectedEndpointName.value}&from=${from}&to=${to}&q=${messageFilterString.value}&page_size=${itemsPerPage.value}&sort=${sortByInstances.value.property}&direction=${sortByInstances.value.isAscending ? "asc" : "desc"}`
        );
        totalCount.value = parseInt(response.headers.get("total-count") ?? "0");
        messages.value = data;
      } catch (e) {
        messages.value = [];
        throw e;
      }
    },
    null,
    true
  );

  const refresh = dataRetriever.executeAndResetTimer;
  watch([itemsPerPage, sortByInstances, messageFilterString, selectedEndpointName, dateRange], async () => {
    console.log("watch triggered");
    await refresh();
  });

  return {
    refresh,
    sortBy: sortByInstances,
    messages,
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
