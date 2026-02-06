<script setup lang="ts">
import EventItemShort from "@/components/EventItemShort.vue";
import LicenseNotExpired from "@/components/LicenseNotExpired.vue";
import ServiceControlAvailable from "@/components/ServiceControlAvailable.vue";
import CustomChecksDashboardItem from "@/components/customchecks/CustomChecksDashboardItem.vue";
import HeartbeatsDashboardItem from "@/components/heartbeats/HeartbeatsDashboardItem.vue";
import FailedMessagesDashboardItem from "@/components/failedmessages/FailedMessagesDashboardItem.vue";
import PlatformCapabilitiesDashboardItem from "@/components/platformcapabilities/PlatformCapabilitiesDashboardItem.vue";
import { useConfigurationStore } from "@/stores/ConfigurationStore";
import { storeToRefs } from "pinia";

const configurationStore = useConfigurationStore();
const { isMassTransitConnected } = storeToRefs(configurationStore);
</script>

<template>
  <div class="container">
    <ServiceControlAvailable>
      <LicenseNotExpired>
        <div class="row">
          <div class="col-12">
            <h6>System status</h6>
            <p class="system-status-description">Monitor your system's health and performance.</p>
            <div class="row box system-status">
              <div class="col-12">
                <div class="row">
                  <div class="system-status-item">
                    <HeartbeatsDashboardItem />
                  </div>
                  <div class="system-status-item">
                    <FailedMessagesDashboardItem />
                  </div>
                  <div class="system-status-item">
                    <CustomChecksDashboardItem />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="isMassTransitConnected === false" class="col-12 platform-capabilities-section">
            <PlatformCapabilitiesDashboardItem />
          </div>
          <EventItemShort></EventItemShort>
        </div>
      </LicenseNotExpired>
    </ServiceControlAvailable>
  </div>
</template>

<style scoped>
.system-status:hover {
  background-color: #fff;
  border-color: #eee !important;
  cursor: default;
}

.system-status .row {
  display: flex;
}

.system-status-item {
  flex: 1;
}
.system-status-description {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin: 0 0 10px 0;
}

.platform-capabilities-section {
  margin-top: 2em;
}
</style>
