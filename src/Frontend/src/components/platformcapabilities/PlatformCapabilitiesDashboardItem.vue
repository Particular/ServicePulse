<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import CapabilityCard from "@/components/platformcapabilities/CapabilityCard.vue";
import { useAuditingCapability } from "@/components/platformcapabilities/capabilities/AuditingCapability";
import { useMonitoringCapability } from "@/components/platformcapabilities/capabilities/MonitoringCapability";
import { useErrorCapability } from "@/components/platformcapabilities/capabilities/ErrorCapability";
import { Capability } from "@/components/platformcapabilities/constants";
import { getAuditingWizardPages } from "@/components/platformcapabilities/wizards/AuditingWizardPages";
import { getMonitoringWizardPages } from "@/components/platformcapabilities/wizards/MonitoringWizardPages";
import { usePlatformCapabilitiesStore } from "@/stores/PlatformCapabilitiesStore";
import FAIcon from "@/components/FAIcon.vue";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const platformCapabilitiesStore = usePlatformCapabilitiesStore();
const { visibility } = storeToRefs(platformCapabilitiesStore);

const auditing = useAuditingCapability();
const monitoring = useMonitoringCapability();
const error = useErrorCapability();

const auditingWizardPages = computed(() => getAuditingWizardPages(auditing.status.value));
const monitoringWizardPages = computed(() => getMonitoringWizardPages(monitoring.status.value));

// Check if any cards are hidden (to show restore option)
const hasHiddenCards = computed(() => !visibility.value.showAuditingCard || !visibility.value.showMonitoringCard || !visibility.value.showErrorCard);
</script>

<template>
  <div v-if="visibility.showSection" class="platform-capabilities">
    <div class="capabilities-header">
      <div class="capabilities-title-row">
        <div
          id="collapse-capabilities-btn"
          class="capabilities-toggle hide-section-btn"
          role="button"
          tabindex="0"
          @click="platformCapabilitiesStore.toggleSection()"
          @keydown.enter.prevent="platformCapabilitiesStore.toggleSection()"
          @keydown.space.prevent="platformCapabilitiesStore.toggleSection()"
        >
          <FAIcon :icon="faChevronRight" class="section-chevron expanded" />
          <div>
            <h6>Platform Capabilities</h6>
            <p class="capabilities-description">Discover and configure the capabilities of the Particular Service Platform</p>
          </div>
        </div>
        <div class="capabilities-actions">
          <button v-if="hasHiddenCards" class="btn-link restore-btn" @click="platformCapabilitiesStore.showAll()" v-tippy="'Show all hidden cards'">Show All</button>
        </div>
      </div>
    </div>
    <div class="capabilities-list">
      <CapabilityCard
        v-if="visibility.showAuditingCard"
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
        @hide="platformCapabilitiesStore.toggleAuditingCard()"
      ></CapabilityCard>
      <CapabilityCard
        v-if="visibility.showMonitoringCard"
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
        @hide="platformCapabilitiesStore.toggleMonitoringCard()"
      ></CapabilityCard>
      <CapabilityCard
        v-if="visibility.showErrorCard"
        :title="Capability.Error"
        subtitle="Manage and retry failed messages"
        :status="error.status.value"
        :icon="error.icon.value"
        :description="error.description.value"
        :indicators="error.indicators.value"
        :isLoading="error.isLoading.value"
        :help-button-text="error.helpButtonText.value"
        :help-button-url="error.helpButtonUrl.value"
        @hide="platformCapabilitiesStore.toggleErrorCard()"
      ></CapabilityCard>
    </div>
  </div>
  <div v-else class="platform-capabilities-collapsed">
    <div
      id="expand-capabilities-btn"
      class="capabilities-toggle"
      role="button"
      tabindex="0"
      @click="platformCapabilitiesStore.toggleSection()"
      @keydown.enter.prevent="platformCapabilitiesStore.toggleSection()"
      @keydown.space.prevent="platformCapabilitiesStore.toggleSection()"
    >
      <FAIcon :icon="faChevronRight" class="section-chevron" />
      <h6>Show Platform Capabilities</h6>
    </div>
  </div>
</template>

<style scoped>
.capabilities-header {
  margin-bottom: 10px;
}

.capabilities-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.capabilities-toggle {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
  user-select: none;
}

.capabilities-toggle:hover {
  background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
}

.capabilities-toggle:focus-visible {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
}

.capabilities-toggle h6 {
  margin: 0;
}

.section-chevron {
  font-size: 12px;
  color: var(--text-secondary, #888);
  margin-top: 3px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.section-chevron.expanded {
  transform: rotate(90deg);
}

.capabilities-description {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin: 0;
}

.capabilities-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-link {
  background: none;
  border: none;
  color: var(--primary-color, #007bff);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
}

.btn-link:hover {
  text-decoration: underline;
}

.capabilities-list {
  display: flex;
  gap: 16px;
}

.capabilities-list > * {
  flex: 1;
}

.platform-capabilities-collapsed {
  padding: 4px 0;
}
</style>
