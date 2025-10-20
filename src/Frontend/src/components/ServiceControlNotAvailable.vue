<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import useConnectionsAndStatsAutoRefresh from "@/composables/useConnectionsAndStatsAutoRefresh";
import { useServiceControlStore } from "@/stores/ServiceControlStore";

const { store: connectionStore } = useConnectionsAndStatsAutoRefresh();
const connectionState = connectionStore.connectionState;
const serviceControlStore = useServiceControlStore();
</script>

<template>
  <div class="sp-loader" v-if="connectionState.connecting && !connectionState.unableToConnect"></div>
  <template v-if="connectionState.unableToConnect">
    <div class="text-center monitoring-no-data">
      <h1>Cannot connect to ServiceControl</h1>
      <p>
        ServicePulse is unable to connect to the ServiceControl instance at
        <span id="serviceControlUrl">{{ serviceControlStore.serviceControlUrl }}</span
        >. Please ensure that ServiceControl is running and accessible from your machine.
      </p>
      <div class="action-toolbar">
        <RouterLink :to="routeLinks.configuration.connections.link"><span class="btn btn-default btn-primary whiteText">View Connection Details</span></RouterLink>
        <a class="btn btn-default btn-secondary" href="https://docs.particular.net/monitoring/metrics/">Learn more</a>
      </div>
    </div>
  </template>
</template>

<style scoped>
.action-toolbar {
  display: flex;
  gap: 0.5em;
  justify-content: center;
}

.sp-loader {
  width: 100%;
  height: 90vh;
  margin-top: -100px;
  background-image: url("@/assets/sp-loader.gif");
  background-size: 150px 150px;
  background-position: center center;
  background-repeat: no-repeat;
}
</style>
