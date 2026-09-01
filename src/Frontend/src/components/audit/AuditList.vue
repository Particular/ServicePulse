<script setup lang="ts">
import { FieldNames, useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import ResultsCount from "@/components/ResultsCount.vue";
import FiltersPanel from "@/components/audit/FiltersPanel.vue";
import AuditListItem from "@/components/audit/AuditListItem.vue";
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from "vue";
import RefreshConfig from "../RefreshConfig.vue";
import AutoRefreshIndicator from "../AutoRefreshIndicator.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useFetchWithAutoRefresh from "@/composables/autoRefresh";
import WizardDialog from "@/components/platformcapabilities/WizardDialog.vue";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import PageBanner, { type BannerMessage } from "@/components/PageBanner.vue";
import { useConfigurationStore } from "@/stores/ConfigurationStore";

const store = useAuditStore();
const { messages, totalCount, sortBy, messageFilterString, selectedEndpointName, itemsPerPage, dateRange, queryFailed } = storeToRefs(store);
const route = useRoute();
const router = useRouter();
const autoRefreshValue = ref<number | null>(null);
const { refreshNow, isRefreshing, updateInterval, isActive, start, stop, nextRefreshAt } = useFetchWithAutoRefresh("audit-list", store.refresh, 0);
const firstLoad = ref(true);
const queryInProgress = computed(() => firstLoad.value || isRefreshing.value);
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
    try {
      await Promise.all([refreshNow(), store.loadEndpoints()]);
    } finally {
      firstLoad.value = false;
    }
  }, 0);
});

onBeforeUnmount(() => {
  // Leaving the view stops all of its activity: the auto-refresh poll is released and the
  // in-flight query is aborted so it does not keep running (server-side included) in the background
  stop();
  store.cancelQuery();
});

// The route is the single source of truth for the query: control changes only push to the router,
// and only a route change triggers a fetch. Having the fetch in both watchers (and the route in the
// controls watcher) made a single control change fire the same query up to three times.
watch(
  () => route.query,
  async () => {
    setQuery();
    await refreshNow();
  }
);

function controlsQuery() {
  const [fromDate, toDate] = dateRange.value;

  return {
    sortBy: sortBy.value.property,
    sortDir: sortBy.value.isAscending ? "asc" : "desc",
    filter: messageFilterString.value,
    endpoint: selectedEndpointName.value,
    from: fromDate?.toISOString() ?? "",
    to: toDate?.toISOString() ?? "",
    pageSize: itemsPerPage.value,
  };
}

// The serialized controls state the route last applied (via setQuery) or that was last pushed.
// The controls watcher only pushes when the controls actually moved away from this, which makes
// it safe to react to changes at any time — including while the first (possibly very slow)
// query is still running, so a user typing a search is never ignored.
let lastAppliedControlsQuery = "";

const watchHandle = watch([itemsPerPage, sortBy, messageFilterString, selectedEndpointName, dateRange], async () => {
  const query = controlsQuery();
  const serialized = JSON.stringify(query);

  if (serialized === lastAppliedControlsQuery) {
    return;
  }

  lastAppliedControlsQuery = serialized;
  await router.push({ query });
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

  lastAppliedControlsQuery = JSON.stringify(controlsQuery());

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
      <RefreshConfig v-model="autoRefreshValue" :query-in-progress="queryInProgress" @manual-refresh="refreshNow" />
      <AutoRefreshIndicator :next-refresh-at="nextRefreshAt" :interval-ms="autoRefreshValue" :refreshing="isRefreshing" />
      <div class="row">
        <FiltersPanel />
      </div>
      <div class="row">
        <ResultsCount :displayed="messages.length" :total="totalCount" />
      </div>
      <PageBanner v-if="bannerMessage && isMassTransitConnected === false" :message="bannerMessage" :show-action="showBannerAction" @action="showWizard = true" />
    </div>
    <WizardDialog v-if="showWizard" title="Getting Started with Auditing" :pages="wizardPages" @close="showWizard = false" />
    <div v-if="queryFailed && !queryInProgress" class="query-error" role="alert" data-testid="query-error">
      <strong>The query failed or took too long and was stopped.</strong>
      <p>The ServiceControl instance might be too busy. Try again in an off-peak period, reduce the maximum number of results ("Show"), or narrow the date range.</p>
    </div>
    <div class="row results-table">
      <LoadingSpinner v-if="firstLoad || isRefreshing" :overlay="isRefreshing && messages.length > 0" />
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

.query-error {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #f0c2c2;
  border-left: 4px solid #ce4844;
  border-radius: 4px;
  background-color: #fdf7f7;
}

.query-error p {
  margin: 0.25rem 0 0;
}

.results-table {
  margin-top: 1rem;
  margin-bottom: 5rem;
  background-color: #ffffff;
  position: relative;
}
</style>
