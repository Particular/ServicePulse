<script setup lang="ts">
import { FieldNames, useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import ResultsCount from "@/components/ResultsCount.vue";
import FiltersPanel from "@/components/audit/FiltersPanel.vue";
import AuditListItem from "@/components/audit/AuditListItem.vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import RefreshConfig from "../RefreshConfig.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useFetchWithAutoRefresh from "@/composables/autoRefresh";
import WizardDialog from "@/components/platformcapabilities/WizardDialog.vue";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import PageBanner, { type BannerMessage } from "@/components/PageBanner.vue";
import { useConfigurationStore } from "@/stores/ConfigurationStore";

const store = useAuditStore();
const { messages, totalCount, sortBy, messageFilterString, selectedEndpointName, itemsPerPage, dateRange } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const autoRefreshValue = ref<number | null>(null);
const { refreshNow, isRefreshing, updateInterval, isActive, start, stop } = useFetchWithAutoRefresh("audit-list", store.refresh, 0);
const firstLoad = ref(true);
const showWizard = ref(false);
const { status: auditStatus } = useAuditingCapability();
const wizardPages = computed(() => getAuditingWizardPages(auditStatus.value));
const configurationStore = useConfigurationStore();
const { isMassTransitConnected } = storeToRefs(configurationStore);

const bannerMessage = computed<BannerMessage | null>(() => {
  switch (auditStatus.value) {
    case CapabilityStatus.InstanceNotConfigured:
      return {
        title: "No ServiceControl Audit instance configured.",
        description: "A ServiceControl Audit instance is required to view processed messages. Click 'Get Started' to learn how to set one up.",
      };
    case CapabilityStatus.EndpointsNotConfigured:
      return {
        title: "No successful audit messages found.",
        description: "Auditing may not be enabled on your endpoints. Click 'Get Started' to find out how to enable auditing.",
      };
    case CapabilityStatus.Unavailable:
      return {
        title: "All ServiceControl Audit instances are not responding.",
        description: "The configured audit instances appears to be offline or unreachable. Check that the service is running and accessible.",
      };
    case CapabilityStatus.PartiallyUnavailable:
      return {
        title: "Some ServiceControl Audit instances are not responding.",
        description: "One or more audit instances appear to be offline. Some audit data may be unavailable until all instances are restored.",
      };
    default:
      return null;
  }
});

const showBannerAction = computed(() => auditStatus.value !== CapabilityStatus.Unavailable && auditStatus.value !== CapabilityStatus.PartiallyUnavailable);

onBeforeMount(() => {
  setQuery();

  //without setTimeout, this happens before the store is properly initialised, and therefore the query route values aren't applied to the refresh
  setTimeout(async () => {
    await Promise.all([refreshNow(), store.loadEndpoints()]);
    firstLoad.value = false;
  }, 0);
});

watch(
  () => router.currentRoute.value.query,
  async () => {
    setQuery();
    await refreshNow();
  },
  { deep: true }
);

const watchHandle = watch([() => route.query, itemsPerPage, sortBy, messageFilterString, selectedEndpointName, dateRange], async () => {
  if (firstLoad.value) {
    return;
  }

  const [fromDate, toDate] = dateRange.value;
  const from = fromDate?.toISOString() ?? "";
  const to = toDate?.toISOString() ?? "";

  await router.push({
    query: {
      sortBy: sortBy.value.property,
      sortDir: sortBy.value.isAscending ? "asc" : "desc",
      filter: messageFilterString.value,
      endpoint: selectedEndpointName.value,
      from,
      to,
      pageSize: itemsPerPage.value,
    },
  });

  await refreshNow();
});

function setQuery() {
  const query = router.currentRoute.value.query;

  watchHandle.pause();

  messageFilterString.value = query.filter ? (query.filter as string) : "";
  sortBy.value =
    query.sortBy && query.sortDir //
      ? { isAscending: query.sortDir === "asc", property: query.sortBy as string }
      : (sortBy.value = { isAscending: false, property: FieldNames.TimeSent });
  itemsPerPage.value = query.pageSize ? parseInt(query.pageSize as string) : 100;
  dateRange.value = query.from && query.to ? [new Date(query.from as string), new Date(query.to as string)] : [];
  selectedEndpointName.value = (query.endpoint ?? "") as string;

  watchHandle.resume();
}

watch(autoRefreshValue, (newValue) => {
  if (newValue === null || newValue === 0) {
    stop();
  } else {
    updateInterval(newValue);
    if (!isActive.value) {
      start();
    }
  }
});
</script>

<template>
  <div>
    <div class="header">
      <RefreshConfig v-model="autoRefreshValue" :isLoading="isRefreshing" @manual-refresh="refreshNow" />
      <div class="row">
        <FiltersPanel />
      </div>
      <div class="row">
        <ResultsCount :displayed="messages.length" :total="totalCount" />
      </div>
      <PageBanner v-if="bannerMessage && isMassTransitConnected === false" :message="bannerMessage" :show-action="showBannerAction" @action="showWizard = true" />
    </div>
    <WizardDialog v-if="showWizard" title="Getting Started with Auditing" :pages="wizardPages" @close="showWizard = false" />
    <div class="row results-table">
      <LoadingSpinner v-if="firstLoad" />
      <template v-for="message in messages" :key="message.id">
        <AuditListItem :message="message" />
      </template>
    </div>
  </div>
</template>

<style scoped>
@import "../list.css";

.header {
  position: sticky;
  top: -3rem;
  background: #f2f6f7;
  z-index: 100;
  /* set padding/margin so that the sticky version is offset, but not the non-sticky version */
  padding-top: 0.5rem;
  margin-top: -0.5rem;
}

.results-table {
  margin-top: 1rem;
  margin-bottom: 5rem;
  background-color: #ffffff;
}
</style>
