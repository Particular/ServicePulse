<script setup lang="ts">
import { computed } from "vue";
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { useMonitoringCapability } from "@/components/platformcapabilities/capabilities/MonitoringCapability";
import { Capability } from "@/components/platformcapabilities/types";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { getMonitoringWizardPages } from "@/components/platformcapabilities/wizards/MonitoringWizardPages";

const auditing = useAuditingCapability();
const monitoring = useMonitoringCapability();

const auditingWizardPages = computed(() => getAuditingWizardPages(auditing.status.value));
const monitoringWizardPages = computed(() => getMonitoringWizardPages(monitoring.status.value));
</script>

<template>
  <div class="platform-capabilities">
    <div class="capabilities-header">
      <h6>Platform Capabilities</h6>
      <p class="capabilities-description">Discover and configure the capabilities of the Particular Service Platform</p>
    </div>
    <div class="capabilities-list">
      <CapabilityCard
        :title="Capability.Auditing"
        subtitle="Track and search all successful messages flowing through your system"
        :status="auditing.status.value"
        :icon="auditing.icon.value"
        :description="auditing.description.value"
        :indicators="auditing.indicators.value"
        :isLoading="auditing.isLoading.value"
        :help-button-text="auditing.helpButtonText.value"
        :help-button-url="auditing.helpButtonUrl.value"
        :wizard-pages="auditingWizardPages"
      ></CapabilityCard>
      <CapabilityCard
        :title="Capability.Monitoring"
        subtitle="Monitor endpoint performance and throughput"
        :status="monitoring.status.value"
        :icon="monitoring.icon.value"
        :description="monitoring.description.value"
        :indicators="monitoring.indicators.value"
        :isLoading="monitoring.isLoading.value"
        :help-button-text="monitoring.helpButtonText.value"
        :help-button-url="monitoring.helpButtonUrl.value"
        :wizard-pages="monitoringWizardPages"
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
