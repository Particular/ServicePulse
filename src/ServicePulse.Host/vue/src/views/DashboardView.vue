<script setup>
import DashboardItem from "../components/DashboardItem.vue";
import EventItemShort from "../components/EventItemShort.vue";
import LicenseExpired from "../components/LicenseExpired.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import { connectionState, stats } from "../composables/serviceServiceControl";
import { useLicenseStatus } from "./../composables/serviceLicense.js";
</script>

<template>
  <LicenseExpired />
  <template v-if="!useLicenseStatus.isExpired">
    <div class="container">
      <ServiceControlNotAvailable />

      <template v-if="connectionState.connected">
        <div class="row">
          <div class="col-sm-12">
            <h1>Dashboard</h1>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-12">
            <h6>System status</h6>
            <div class="row box system-status">
              <div class="col-sm-12">
                <div class="row">
                  <div class="col-xs-4">
                    <DashboardItem
                      :counter="stats.number_of_failed_heartbeats"
                      :url="'/a/#/endpoints'"
                      :iconClass="'fa-heartbeat'"
                      >Heartbeats</DashboardItem
                    >
                  </div>
                  <div class="col-xs-4">
                    <DashboardItem
                      :counter="stats.number_of_failed_messages"
                      :url="'/a/#/failed-messages/groups'"
                      :iconClass="'fa-envelope'"
                      >Failed Messages</DashboardItem
                    >
                  </div>
                  <div class="col-xs-4">
                    <DashboardItem
                      :counter="stats.number_of_failed_checks"
                      :url="'/a/#/custom-checks'"
                      :iconClass="'fa-check'"
                      >Custom Checks</DashboardItem
                    >
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
