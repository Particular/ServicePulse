<script setup lang="ts">
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";
import useThroughputStoreAutoRefresh from "@/composables/useThroughputStoreAutoRefresh";
import { storeToRefs } from "pinia";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { useMonitoringCapability } from "@/components/platformcapabilities/capabilities/MonitoringCapability";

const { store } = useThroughputStoreAutoRefresh();
const { testResults } = storeToRefs(store);
const auditing = useAuditingCapability(testResults);
const monitoring = useMonitoringCapability();
</script>

<template>
  <div class="platform-capabilities">
    <div class="capabilities-header">
      <h6>Platform Capabilities</h6>
      <p class="capabilities-description">Discover and configure the capabilities of the Particular Service Platform</p>
    </div>
    <div class="capabilities-list">
      <CapabilityCard
        title="Auditing"
        subtitle="Track and search all successful messages flowing through your system"
        :status="auditing.status.value"
        :icon="auditing.icon.value"
        :description="auditing.description.value"
        :indicators="auditing.indicators.value"
        :isLoading="testResults === null"
        help-url="https://docs.particular.net/nservicebus/operations/auditing"
        data-url="#/messages"
      ></CapabilityCard>
      <CapabilityCard
        title="Monitoring"
        subtitle="Monitor endpoint performance and throughput"
        :status="monitoring.status.value"
        :icon="monitoring.icon.value"
        :description="monitoring.description.value"
        :indicators="monitoring.indicators.value"
        :isLoading="testResults === null"
        help-url="https://docs.particular.net/monitoring/metrics/install-plugin"
        data-url="#/monitoring"
      ></CapabilityCard>
    </div>
  </div>
</template>

<style scoped>
.capabilities-header {
  margin-bottom: 10px;
}
.capabilities-description {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin: 0;
}
.capabilities-list {
  display: flex;
  gap: 16px;
}
.capabilities-list > * {
  flex: 1;
}
</style>
