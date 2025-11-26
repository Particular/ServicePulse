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
import FAIcon from "@/components/FAIcon.vue";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import WizardDialog from "@/components/platformcapabilities/WizardDialog.vue";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";

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
      <div v-if="auditStatus !== CapabilityStatus.Available" class="no-audit-banner">
        <div class="banner-content">
          <FAIcon :icon="faInfoCircle" class="banner-icon" />
          <div class="banner-text">
            <template v-if="auditStatus === CapabilityStatus.InstanceNotConfigured">
              <strong>No ServiceControl Audit instance configured.</strong>
              <p>A ServiceControl Audit instance is required to view processed messages. Click 'Get Started' to learn how to set one up.</p>
            </template>
            <template v-else-if="auditStatus === CapabilityStatus.EndpointsNotConfigured">
              <strong>No successful audit messages found.</strong>
              <p>Auditing may not be enabled on your endpoints. Click 'Get Started' to find out how to enable auditing.</p>
            </template>
            <template v-else-if="auditStatus === CapabilityStatus.Unavailable">
              <strong>All ServiceControl Audit instances are not responding.</strong>
              <p>The configured audit instances appears to be offline or unreachable. Check that the service is running and accessible.</p>
            </template>
            <template v-else-if="auditStatus === CapabilityStatus.PartiallyUnavailable">
              <strong>Some ServiceControl Audit instances are not responding.</strong>
              <p>One or more audit instances appear to be offline. Some audit data may be unavailable until all instances are restored.</p>
            </template>
          </div>
          <template v-if="auditStatus !== CapabilityStatus.Unavailable && auditStatus !== CapabilityStatus.PartiallyUnavailable">
            <button class="banner-link" @click="showWizard = true">Get Started</button>
          </template>
        </div>
      </div>
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

.no-audit-banner {
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f2f9 100%);
  border: 1px solid #c3ddf5;
  border-left: 4px solid #007bff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 1rem;
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.banner-icon {
  font-size: 24px;
  flex-shrink: 0;
  color: #007bff;
}

.banner-text {
  flex: 1;
}

.banner-text strong {
  display: block;
  margin-bottom: 4px;
  color: #333;
  font-size: 14px;
}

.banner-text p {
  margin: 0;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.banner-link {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  align-self: center;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.banner-link:hover {
  background-color: #0056b3;
}
</style>
