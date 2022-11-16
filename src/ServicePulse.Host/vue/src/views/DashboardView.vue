<script setup>
import { inject } from "vue";
import DashboardItem from "../components/DashboardItem.vue";
import EventItemShort from "../components/EventItemShort.vue"
import PlatformLicenseExpired from "../components/PlatformLicenseExpired.vue";
import PlatformTrialExpired from "../components/PlatformTrialExpired.vue";
import PlatformProtectionExpired from "../components/PlatformProtectionExpired.vue";
import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue";
import { key_IsSCConnected, key_ScConnectedAtLeastOnce, key_IsSCConnecting, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired } from "../composables/keys.js"
import { stats } from "./../composables/serviceServiceControl.js"

const isPlatformExpired = inject(key_IsPlatformExpired)
const isPlatformTrialExpired = inject(key_IsPlatformTrialExpired)
const isInvalidDueToUpgradeProtectionExpired = inject(key_IsInvalidDueToUpgradeProtectionExpired)

const isSCConnected = inject(key_IsSCConnected)
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce)
const isSCConnecting = inject(key_IsSCConnecting)

</script>


<template>
  <PlatformLicenseExpired :isPlatformExpired="isPlatformExpired" />
  <PlatformTrialExpired :isPlatformTrialExpired="isPlatformTrialExpired" />
  <PlatformProtectionExpired :isInvalidDueToUpgradeProtectionExpired="isInvalidDueToUpgradeProtectionExpired" />

  <template v-if="!isPlatformTrialExpired && !isPlatformExpired && !isInvalidDueToUpgradeProtectionExpired">
    <div class="container">
      <div class="sp-loader" v-if="isSCConnecting"></div>
      <ServiceControlNotAvailable :isSCConnected="isSCConnected" :isSCConnecting="isSCConnecting" :scConnectedAtLeastOnce="scConnectedAtLeastOnce" />
      
      <template v-if="isSCConnected || scConnectedAtLeastOnce">
        
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
                      <DashboardItem :counter="stats.number_of_failed_heartbeats" :url="'/a/#/endpoints'" :iconClass="'fa-heartbeat'">Heartbeats</DashboardItem>
                    </div>
                    <div class="col-xs-4">
                      <DashboardItem :counter="stats.number_of_failed_messages" :url="'/a/#/failed-messages/groups'" :iconClass="'fa-envelope'">Failed Messages</DashboardItem>
                    </div>
                    <div class="col-xs-4">
                      <DashboardItem :counter="stats.number_of_failed_checks" :url="'/a/#/custom-checks'" :iconClass="'fa-check'">Custom Checks</DashboardItem>
                    </div>
                  </div>
                </div>
              </div>

              <EventItemShort></EventItemShort>
            </div>
          </div>      
      </template>
    </div>
  </template>  
</template>
