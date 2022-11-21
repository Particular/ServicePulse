<script setup>
import { inject, computed } from "vue";
import {
  key_ServiceControlUrl,
  key_IsSCConnected,
  key_IsSCConnecting,
  key_MonitoringUrl,
  key_IsMonitoringEnabled,
  key_IsSCMonitoringConnected,
  key_IsSCMonitoringConnecting,
  key_SCVersion,
  key_NewSCVersion,
  key_NewSCVersionLink,
  key_NewSCVersionNumber,
  key_SPVersion,
  key_NewSPVersion,
  key_NewSPVersionLink,
  key_NewSPVersionNumber,
  key_MonitoringVersion,
  key_NewMonitoringVersion,
  key_NewMonitoringVersionLink,
  key_NewMonitoringVersionNumber,
} from "../composables/keys.js";

const serviceControlUrl = inject(key_ServiceControlUrl);
const isSCConnected = inject(key_IsSCConnected);
const isSCConnecting = inject(key_IsSCConnecting);

const monitoringUrl = inject(key_MonitoringUrl);
const isMonitoringEnabled = inject(key_IsMonitoringEnabled);
const isSCMonitoringConnected = inject(key_IsSCMonitoringConnected);
const isSCMonitoringConnecting = inject(key_IsSCMonitoringConnecting);

const scVersion = inject(key_SCVersion);
const scNewVersion = inject(key_NewSCVersion);
const scNewVersionLink = inject(key_NewSCVersionLink);
const scNewVersionNumber = inject(key_NewSCVersionNumber);
const spVersion = inject(key_SPVersion);
const spNewVersion = inject(key_NewSPVersion);
const spNewVersionLink = inject(key_NewSPVersionLink);
const spNewVersionNumber = inject(key_NewSPVersionNumber);
const monitoringVersion = inject(key_MonitoringVersion);
const monitoringNewVersion = inject(key_NewMonitoringVersion);
const monitoringNewVersionLink = inject(key_NewMonitoringVersionLink);
const monitoringNewVersionNumber = inject(key_NewMonitoringVersionNumber);

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
          <span>
            <i class="fa fa-plus sp-blue"></i>
            <a href="configuration#/endpoint-connection"
              >Connect new endpoint</a
            >
          </span>

          <span v-if="!spNewVersion && spVersion">
            ServicePulse v{{ spVersion }}
          </span>
          <span v-if="spNewVersion && spVersion">
            ServicePulse v{{ spVersion }} (<i
              v-if="spNewVersionNumber"
              class="fa fa-level-up fake-link"
            ></i>
            <a :href="spNewVersionLink" target="_blank"
              >v{{ spNewVersionNumber }} available</a
            >)
          </span>
          <span :title="scAddressTooltip">
            Service Control:
            <span
              class="connected-status"
              v-if="isSCConnected && !isSCConnecting"
            >
              <div class="fa pa-connection-success"></div>
              <span v-if="!scVersion">Connected</span>
              <span v-if="scVersion" class="versionnumber"
                >v{{ scVersion }}</span
              >
              <span v-if="scNewVersion" class="newscversion"
                >(<i class="fa fa-level-up fake-link"></i>
                <a :href="scNewVersionLink" target="_blank"
                  >v{{ scNewVersionNumber }} available</a
                >)</span
              >
            </span>
            <span
              v-if="!isSCConnected && !isSCConnecting"
              class="connection-failed"
            >
              <i class="fa pa-connection-failed"></i> Not connected
            </span>
            <span v-if="isSCConnecting" class="connection-establishing">
              <i class="fa pa-connection-establishing"></i> Connecting
            </span>
          </span>

          <template v-if="isMonitoringEnabled">
            <span
              class="monitoring-connected"
              :title="scMonitoringAddressTooltip"
            >
              SC Monitoring:
              <span
                class="connected-status"
                v-if="isSCMonitoringConnected && !isSCMonitoringConnecting"
              >
                <div class="fa pa-connection-success"></div>
                <span v-if="monitoringVersion"> v{{ monitoringVersion }}</span>
                <span v-if="monitoringNewVersion"
                  >(<i class="fa fa-level-up fake-link"></i>
                  <a :href="monitoringNewVersionLink" target="_blank"
                    >v{{ monitoringNewVersionNumber }} available</a
                  >)</span
                >
              </span>
              <span
                v-if="!isSCMonitoringConnected && !isSCMonitoringConnecting"
                class="connection-failed"
              >
                <i class="fa pa-connection-failed"></i> Not connected
              </span>
              <span
                v-if="isSCMonitoringConnecting"
                class="connection-establishing"
              >
                <i class="fa pa-connection-establishing"></i> Connecting
              </span>
            </span>
          </template>
        </div>
      </div>
    </div>
  </footer>
</template>
