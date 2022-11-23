<script setup>
import { inject, computed } from "vue";
import {
  environment,
  newVersions,
} from "../composables/serviceServiceControl.js";
import {
  key_ServiceControlUrl,
  key_IsSCConnected,
  key_IsSCConnecting,
  key_MonitoringUrl,
  key_IsMonitoringEnabled,
  key_IsSCMonitoringConnected,
  key_IsSCMonitoringConnecting,
} from "../composables/keys.js";

const serviceControlUrl = inject(key_ServiceControlUrl);
const isSCConnected = inject(key_IsSCConnected);
const isSCConnecting = inject(key_IsSCConnecting);

const monitoringUrl = inject(key_MonitoringUrl);
const isMonitoringEnabled = inject(key_IsMonitoringEnabled);
const isSCMonitoringConnected = inject(key_IsSCMonitoringConnected);
const isSCMonitoringConnecting = inject(key_IsSCMonitoringConnecting);

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

          <span
            v-if="
              !newVersions.newSPVersion.newspversion && environment.sp_version
            "
          >
            ServicePulse v{{ environment.sp_version }}
          </span>
          <span
            v-if="
              newVersions.newSPVersion.newspversion && environment.sp_version
            "
          >
            ServicePulse v{{ environment.sp_version }} (<i
              v-if="newVersions.newSPVersion.newspversionnumber"
              class="fa fa-level-up fake-link"
            ></i>
            <a :href="newVersions.newSPVersion.newspversionlink" target="_blank"
              >v{{ newVersions.newSPVersion.newspversionnumber }} available</a
            >)
          </span>
          <span :title="scAddressTooltip">
            Service Control:
            <span
              class="connected-status"
              v-if="isSCConnected && !isSCConnecting"
            >
              <div class="fa pa-connection-success"></div>
              <span v-if="!environment.sc_version">Connected</span>
              <span v-if="environment.sc_version" class="versionnumber"
                >v{{ environment.sc_version }}</span
              >
              <span
                v-if="newVersions.newSCVersion.newscversion"
                class="newscversion"
                >(<i class="fa fa-level-up fake-link"></i>
                <a
                  :href="newVersions.newSCVersion.newscversionlink"
                  target="_blank"
                  >v{{
                    newVersions.newSCVersion.newscversionnumber
                  }}
                  available</a
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
                <span v-if="environment.monitoring_version">
                  v{{ environment.monitoring_version }}</span
                >
                <span v-if="newVersions.newMVersion.newmversion"
                  >(<i class="fa fa-level-up fake-link"></i>
                  <a
                    :href="newVersions.newMVersion.newmversionlink"
                    target="_blank"
                    >v{{
                      newVersions.newMVersion.newmversionnumber
                    }}
                    available</a
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
