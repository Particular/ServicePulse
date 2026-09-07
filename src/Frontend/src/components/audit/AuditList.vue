<script setup lang="ts">
import { FieldNames, useAuditStore } from "@/stores/AuditStore";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import ResultsCount from "@/components/ResultsCount.vue";
import FiltersPanel from "@/components/audit/FiltersPanel.vue";
import ResultsOptions from "@/components/audit/ResultsOptions.vue";
import AuditListItem from "@/components/audit/AuditListItem.vue";
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from "vue";
import RefreshConfig from "../RefreshConfig.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import useFetchWithAutoRefresh from "@/composables/autoRefresh";
import WizardDialog from "@/components/platformcapabilities/WizardDialog.vue";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import PageBanner, { type BannerMessage } from "@/components/PageBanner.vue";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { loadDefaultRange, narrowingPresets, resolveTimeRange, type RangePreset } from "@/components/audit/timeRange";

const store = useAuditStore();
const { messages, newMessageIds, totalCount, sortBy, messageFilterString, selectedEndpointName, itemsPerPage, timeRangeFrom, timeRangeTo, queryFailed, queryDurationMs, queryCompletedAt } = storeToRefs(store);
const newRowIds = computed(() => new Set(newMessageIds.value));
const route = useRoute();
const router = useRouter();
const autoRefreshValue = ref<number | null>(null);
const { refreshNow, isRefreshing, updateInterval, isActive, start, stop, nextRefreshAt } = useFetchWithAutoRefresh("audit-list", store.refresh, 0);
const firstLoad = ref(true);
const queryInProgress = computed(() => firstLoad.value || isRefreshing.value);

// A query that has run for a while gets advice rather than a clock: the only thing
// the elapsed time ever told the user was "this is slow, make it lighter"
const slowQueryAfterMs = 5000;
const slowQuery = ref(false);
let slowQueryTimer: number | undefined;
watch(
  queryInProgress,
  (running) => {
    window.clearTimeout(slowQueryTimer);
    slowQuery.value = false;
    if (running) slowQueryTimer = window.setTimeout(() => (slowQuery.value = true), slowQueryAfterMs);
  },
  { immediate: true }
);
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

// Query cost grows with the time window, so a timed-out query's escape hatch
// is a narrower one — offered as one click instead of prose alone
const hasNoTimeFilter = computed(() => resolveTimeRange({ from: timeRangeFrom.value, to: timeRangeTo.value }) === null);
const narrowOptions = computed(() => (queryFailed.value ? narrowingPresets({ from: timeRangeFrom.value, to: timeRangeTo.value }) : []));

function applyNarrowing(preset: RangePreset) {
  timeRangeFrom.value = preset.from;
  timeRangeTo.value = preset.to;
}

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
  window.clearTimeout(slowQueryTimer);
  // The rows belong to this visit: the next one may carry different query inputs, so it
  // starts from a clean list (a refresh in place, by contrast, keeps the stale rows)
  store.clearResults();
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
  return {
    sortBy: sortBy.value.property,
    sortDir: sortBy.value.isAscending ? "asc" : "desc",
    filter: messageFilterString.value,
    endpoint: selectedEndpointName.value,
    from: timeRangeFrom.value.trim(),
    to: timeRangeTo.value.trim(),
    pageSize: itemsPerPage.value,
  };
}

// The serialized controls state the route last applied (via setQuery) or that was last pushed.
// The controls watcher only pushes when the controls actually moved away from this, which makes
// it safe to react to changes at any time — including while the first (possibly very slow)
// query is still running, so a user typing a search is never ignored.
let lastAppliedControlsQuery = "";

const watchHandle = watch([itemsPerPage, sortBy, messageFilterString, selectedEndpointName, timeRangeFrom, timeRangeTo], async () => {
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
  if (query.from !== undefined || query.to !== undefined) {
    timeRangeFrom.value = (query.from as string) ?? "";
    timeRangeTo.value = (query.to as string) ?? "";
  } else {
    // No range in the URL: the user's saved default (factory: last 6 hours)
    const defaultRange = loadDefaultRange();
    timeRangeFrom.value = defaultRange.from;
    timeRangeTo.value = defaultRange.to;
  }
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
      <div class="row">
        <FiltersPanel>
          <template #actions>
            <RefreshConfig v-model="autoRefreshValue" :query-in-progress="queryInProgress" :next-refresh-at="nextRefreshAt" @manual-refresh="refreshNow" @cancel-query="store.cancelQuery" />
          </template>
        </FiltersPanel>
      </div>
      <div class="row results-row">
        <div class="results-summary">
          <ResultsCount :displayed="messages.length" :total="totalCount" :duration-ms="queryDurationMs" :completed-at="queryCompletedAt" />
          <span v-if="slowQuery && queryInProgress" class="slow-query" role="status" data-testid="slow-query-hint">Still running · a narrower time range makes the query lighter.</span>
        </div>
        <ResultsOptions />
      </div>
      <PageBanner v-if="bannerMessage && isMassTransitConnected === false" :message="bannerMessage" :show-action="showBannerAction" @action="showWizard = true" />
    </div>
    <WizardDialog v-if="showWizard" title="Getting Started with Auditing" :pages="wizardPages" @close="showWizard = false" />
    <div v-if="queryFailed && !queryInProgress" class="query-error" role="alert" data-testid="query-error">
      <strong>The query failed or took too long and was stopped.</strong>
      <p v-if="hasNoTimeFilter">This query has no time filter, so it scans the whole audit store. Bounding it is the quickest fix — or try again in an off-peak period.</p>
      <p v-else>Query cost grows with the size of the time window. Try a narrower range, add a search term or endpoint filter, or reduce the number of results ("Show").</p>
      <div v-if="narrowOptions.length > 0" class="error-actions">
        <button v-for="preset in narrowOptions" :key="preset.label" type="button" class="narrow-action" data-testid="narrow-range" @click="applyNarrowing(preset)">{{ preset.label }}</button>
      </div>
    </div>
    <div class="row results-table">
      <!-- Only when there is nothing to show yet. A re-fetch over existing rows leaves them
           visible and usable: the refresh button already signals the running query -->
      <LoadingSpinner v-if="firstLoad || (isRefreshing && messages.length === 0)" />
      <template v-for="message in messages" :key="message.id">
        <AuditListItem :message="message" :class="{ 'new-row': newRowIds.has(message.id) }" />
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

.error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.narrow-action {
  border: 1px solid #ce4844;
  background: #fff;
  color: #ce4844;
  border-radius: 4px;
  padding: 0.2rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.narrow-action:hover {
  background: #ce4844;
  color: #fff;
}

/* Summary on the left, Show/Sort/Times pinned on the right. The right group never
   shrinks and never wraps; the summary is the side that gives, and a slow-query hint
   goes on its own line under it rather than pushing the options around */
.results-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

/* ResultsCount's root uses the bootstrap .col class (flex-grow: 1); size it here */
.results-row > * {
  width: auto;
}

.results-row > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}

.results-row > :last-child {
  flex: 0 0 auto;
  margin-left: auto;
  white-space: nowrap;
}

.slow-query {
  display: block;
  margin-top: 0.1rem;
  font-size: 0.875em;
  color: #8a6d3b;
}

.results-table {
  margin-top: 1rem;
  margin-bottom: 5rem;
  background-color: #ffffff;
  position: relative;
  /* The results list is a grid that places nothing itself: it only declares the six
     columns, and every row (AuditListItem) joins them with `subgrid`. Declaring them here,
     once, is what keeps rows aligned: a column is measured across ALL rows, which a row
     laying out its own columns cannot do.

       1.8em                       status icon
       minmax(0, 1fr)              message id: the one value allowed to shrink and break,
                                   so a long id never pushes the values off the row
       minmax(max-content, 1fr)    each value column, read as: never narrower than its
                                   widest value in the list (so nothing wraps), and once
                                   every column has that, share the leftover width equally
                                   (so the columns spread out on a wide screen instead of
                                   huddling on the left)

     Deliberately NOT a size container: combining container-type with content-sized
     tracks froze Chrome's layout. */
  display: grid;
  grid-template-columns: 1.8em minmax(0, 1fr) repeat(4, minmax(max-content, 1fr));
  column-gap: 0.375rem;
  align-content: start;
}

/* Non-row children (the first-load spinner) span the full width */
.results-table > :not(.item) {
  grid-column: 1 / -1;
}

/* A row that arrived since the previous refresh of the same query slides in and
   glows briefly, so what changed is visible without hunting for it. The glow
   lasts a few seconds because auto-refresh ticks are seconds apart, and it plays
   once per row: the element is new to the DOM (keyed by id), so the animation
   starts on insertion and does not restart on later renders. */
.results-table > .new-row {
  animation: new-row-arrive 3s ease-out;
}

@keyframes new-row-arrive {
  0% {
    opacity: 0;
    transform: translateY(-0.5rem);
    background-color: #d3ebf2;
  }
  12% {
    opacity: 1;
    transform: none;
    background-color: #d3ebf2;
  }
  100% {
    background-color: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .results-table > .new-row {
    animation: new-row-glow 3s ease-out;
  }

  @keyframes new-row-glow {
    0%,
    40% {
      background-color: #d3ebf2;
    }
    100% {
      background-color: transparent;
    }
  }
}
</style>
