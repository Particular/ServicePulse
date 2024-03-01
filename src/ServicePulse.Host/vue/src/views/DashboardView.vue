<script setup lang="ts">
import DashboardItem from "@/components/DashboardItem.vue";
import EventItemShort from "@/components/EventItemShort.vue";
import LicenseExpired from "@/components/LicenseExpired.vue";
import ServiceControlNotAvailable from "@/components/ServiceControlNotAvailable.vue";
import { connectionState, stats } from "@/composables/serviceServiceControl";
import { licenseStatus } from "@/composables/serviceLicense";
import routeLinks from "@/router/routeLinks";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container">
      <ServiceControlNotAvailable />

      <template v-if="connectionState.connected">
        <div class="row">
          <div class="col-12">
            <h1>Dashboard</h1>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <h6>System status</h6>
            <div class="row box system-status">
              <div class="col-12">
                <div class="row">
                  <div class="col-4">
                    <DashboardItem :counter="stats.number_of_failed_heartbeats" :url="routeLinks.heartbeats" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
                  </div>
                  <div class="col-4">
                    <DashboardItem :counter="stats.number_of_failed_messages" :url="'#/failed-messages'" :iconClass="'fa-envelope'">Failed Messages</DashboardItem>
                  </div>
                  <div class="col-4">
                    <DashboardItem :counter="stats.number_of_failed_checks" :url="routeLinks.customChecks" :iconClass="'fa-check'">Custom Checks</DashboardItem>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <EventItemShort></EventItemShort>
        </div>
      </template>
    </div>
  </template>
</template>

<style>
.system-status:hover {
  background-color: #fff;
  border-color: #eee !important;
  cursor: default;
}

.summary-item {
  background: #fff none repeat scroll 0 0;
  border: 1px solid #fff;
  border-radius: 4px;
  color: #777f7f;
  display: block;
  padding: 25px 10px;
  position: relative;
  text-align: center;
}

.summary-item .badge,
.summary-item .label {
  font-size: 18px;
  margin-left: 12px;
  position: absolute;
  top: 2px;
}

.summary-info,
.summary-info > .fa,
a.summary-info:hover {
  color: #777f7f;
}

.summary-danger,
.summary-danger > .fa,
a.summary-danger:hover {
  color: #ce4844;
  font-weight: bold;
}

.summary-item:hover {
  background-color: #edf6f7;
  border-color: #00a3c4 !important;
  cursor: pointer;
}
</style>
