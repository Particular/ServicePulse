<script setup>
// Composables
import { onMounted, watch, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { licenseStatus } from "@/composables/serviceLicense";
import { connectionState } from "@/composables/serviceServiceControl";
import { useMonitoringStore } from "@/stores/MonitoringStore";
// Components
import LicenseExpired from "@/components/LicenseExpired.vue";
import ServiceControlNotAvailable from "@/components/ServiceControlNotAvailable.vue";
import EndpointList from "@/components/monitoring/EndpointList.vue";
import MonitoringNoData from "@/components/monitoring/MonitoringNoData.vue";
import MonitoringHead from "@/components/monitoring/MonitoringHead.vue";
import { useMonitoringHistoryPeriodStore } from "@/stores/MonitoringHistoryPeriodStore";

const route = useRoute();
const monitoringStore = useMonitoringStore();
const monitoringHistoryPeriodStore = useMonitoringHistoryPeriodStore();
const { historyPeriod } = storeToRefs(monitoringHistoryPeriodStore);
const noData = computed(() => monitoringStore.endpointListIsEmpty);
let refreshInterval = undefined;

watch(route, () => monitoringHistoryPeriodStore.setHistoryPeriod(route.params.historyPeriod), { deep: true, immediate: true, flush: "pre" });

//const redirectCount = ref(0);

watch(historyPeriod, async (newValue) => {
  await changeRefreshInterval(newValue.refreshIntervalVal);
});

async function changeRefreshInterval(milliseconds) {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
  await monitoringStore.updateEndpointList();
  refreshInterval = setInterval(async () => {
    await monitoringStore.updateEndpointList();
  }, milliseconds);
}

onUnmounted(() => {
  if (typeof refreshInterval !== "undefined") {
    clearInterval(refreshInterval);
  }
});

onMounted(async () => {
  await monitoringStore.initializeStore();
  await changeRefreshInterval(monitoringHistoryPeriodStore.historyPeriod.refreshIntervalVal);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container monitoring-view">
      <ServiceControlNotAvailable />
      <template v-if="connectionState.connected && monitoringStore.isInitialized">
        <MonitoringNoData v-if="noData"></MonitoringNoData>
        <template v-if="!noData">
          <MonitoringHead />
          <EndpointList />
        </template>
      </template>
    </div>
  </template>
</template>
