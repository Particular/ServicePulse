<script setup>
import { computed } from "vue";
import { environment, newVersions, connectionState, monitoringConnectionState } from "../composables/serviceServiceControl.js";
import { serviceControlUrl, monitoringUrl } from "../composables/serviceServiceControlUrls.js";

const isMonitoringEnabled = computed(() => {
  return monitoringUrl.value !== "!" && monitoringUrl.value !== "" && monitoringUrl.value !== null && monitoringUrl.value !== undefined;
});

const scAddressTooltip = computed(() => {
  return "ServiceControl URL " + serviceControlUrl.value;
});

const scMonitoringAddressTooltip = computed(() => {
  return "Monitoring URL " + monitoringUrl.value;
});
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="connectivity-status">
          <span class="secondary">
            <font-awesome-icon icon="fa-solid fa-plus" class="sp-blue" />
            <RouterLink :to="{ name: 'endpoint-connection' }">Connect new endpoint</RouterLink>
          </span>

          <span v-if="!newVersions.newSPVersion.newspversion && environment.sp_version"> ServicePulse v{{ environment.sp_version }} </span>
          <span v-if="newVersions.newSPVersion.newspversion && environment.sp_version">
            ServicePulse v{{ environment.sp_version }} (<font-awesome-icon v-if="newVersions.newSPVersion.newspversionnumber" icon="fa-solid fa-level-up" class="fake-link" />
            <a :href="newVersions.newSPVersion.newspversionlink" target="_blank">v{{ newVersions.newSPVersion.newspversionnumber }} available</a>)
          </span>
          <span :title="scAddressTooltip">
            Service Control:
            <span class="connected-status" v-if="connectionState.connected && !connectionState.connecting">
              <div class="fa pa-connection-success"></div>
              <span v-if="!environment.sc_version">Connected</span>
              <span v-if="environment.sc_version" class="versionnumber">v{{ environment.sc_version }}</span>
              <span v-if="newVersions.newSCVersion.newscversion" class="newscversion"
                >(<font-awesome-icon icon="fa-solid fa-level-up" class="fake-link" />
                <a :href="newVersions.newSCVersion.newscversionlink" target="_blank">v{{ newVersions.newSCVersion.newscversionnumber }} available</a>)</span
              >
            </span>
            <span v-if="!connectionState.connected && !connectionState.connecting" class="connection-failed"> <i class="fa pa-connection-failed"></i> Not connected </span>
            <span v-if="connectionState.connecting" class="connection-establishing"> <i class="pa-connection-establishing"></i> Connecting </span>
          </span>

          <template v-if="isMonitoringEnabled">
            <span class="monitoring-connected" :title="scMonitoringAddressTooltip">
              SC Monitoring:
              <span class="connected-status" v-if="monitoringConnectionState.connected && !monitoringConnectionState.connecting">
                <div class="fa pa-connection-success"></div>
                <span v-if="environment.monitoring_version"> v{{ environment.monitoring_version }}</span>
                <span v-if="newVersions.newMVersion.newmversion"
                  >(<i class="fa fa-level-up fake-link"></i> <a :href="newVersions.newMVersion.newmversionlink" target="_blank">v{{ newVersions.newMVersion.newmversionnumber }} available</a>)</span
                >
              </span>
              <span v-if="!monitoringConnectionState.connected && !monitoringConnectionState.connecting" class="connection-failed"> <i class="fa pa-connection-failed"></i> Not connected </span>
              <span v-if="monitoringConnectionState.connecting" class="connection-establishing"> <i class="pa-connection-establishing"></i> Connecting </span>
            </span>
          </template>
        </div>
      </div>
    </div>
  </footer>
</template>
