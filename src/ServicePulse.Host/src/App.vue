<script setup>
import { ref, provide, computed, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import { key_ServiceControlUrl, key_UnableToConnectToServiceControl, key_UnableToConnectToMonitoring, key_IsSCConnecting, key_IsSCConnected, key_ScConnectedAtLeastOnce, key_UpdateConnections, 
  key_MonitoringUrl, key_IsMonitoringEnabled, key_IsSCMonitoringConnected, key_IsSCMonitoringConnecting, key_MonitoringVersion, key_NewMonitoringVersion, key_NewMonitoringVersionLink, key_NewMonitoringVersionNumber, 
  key_Failedheartbeats, key_Failedmessages, key_Failedcustomchecks, 
  key_License, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired, key_IsExpired,
  key_SPVersion, key_NewSPVersion, key_NewSPVersionLink, key_NewSPVersionNumber, 
  key_SCVersion, key_NewSCVersion, key_NewSCVersionLink, key_NewSCVersionNumber } from "./composables/keys.js"
import { useServiceControlUrls, updateServiceControlUrls } from "./composables/serviceControlUrls.js";
import { useServiceControlStats, useServiceControlVersion, isServiceControlConnecting, isServiceControlConnected, serviceControlConnectedAtLeastOnce, 
  useServiceControlMonitoringStats, isServiceControlMonitoringConnecting, isServiceControlMonitoringConnected, 
  stats, environment, newVersions } from "./composables/serviceControl.js";
import { useLicense, useIsPlatformExpired, useIsPlatformTrialExpired, useIsInvalidDueToUpgradeProtectionExpired } from "./composables/license.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls(useRoute())
provide(key_ServiceControlUrl, serviceControlUrl)
provide(key_MonitoringUrl, monitoringUrl)

let license = ref(null)
useLicense(serviceControlUrl.value).then( lic => {
  license.value = lic.value
})
const isPlatformExpired = computed(() => {
  return license.value? useIsPlatformExpired(license.value.license_status) : false
})
const isPlatformTrialExpired = computed(() => {
  return license.value? useIsPlatformTrialExpired(license.value.license_status) : false
})
const isInvalidDueToUpgradeProtectionExpired = computed(() => {
  return license.value? useIsInvalidDueToUpgradeProtectionExpired(license.value.license_status) : false
})
const isExpired = computed(() => {
  return isPlatformExpired.value || isPlatformTrialExpired.value || isInvalidDueToUpgradeProtectionExpired.value
})
provide(key_License, license)
provide(key_IsPlatformExpired, isPlatformExpired)
provide(key_IsPlatformTrialExpired, isPlatformTrialExpired)
provide(key_IsInvalidDueToUpgradeProtectionExpired, isInvalidDueToUpgradeProtectionExpired)
provide(key_IsExpired, isExpired)


onMounted(() => {
  getServiceControlStats()
})

let failedHeartBeats = ref(null)
let failedMessages = ref(null)
let failedCustomChecks = ref(null)
let isSCConnecting = ref(true)
let isSCConnected = ref(false)
let scConnectedAtLeastOnce = ref(false)

let isSCMonitoringConnecting = ref(true)
let isSCMonitoringConnected = ref(false)
let isMonitoringEnabled = computed(() => {
  return monitoringUrl.value !== '!' 
            && monitoringUrl.value !== ''
            && monitoringUrl.value !== null
            && monitoringUrl.value !== undefined; 
})  
const unableToConnectToServiceControl = computed(() => {
  return isSCConnecting.value ? false : !isSCConnected.value
})  
const unableToConnectToMonitoring = computed(() => {
  return isSCMonitoringConnecting.value ? false : !isSCMonitoringConnected.value
})  

function updateConnections(urlParams, serviceControlUrl, monitoringUrl) {
  updateServiceControlUrls(urlParams, serviceControlUrl, monitoringUrl)
}

setInterval( ()=> getServiceControlStats(), 5000) //NOTE is 5 seconds too often?
setInterval( ()=> getServiceControlMonitoringStats(), 5000) //NOTE is 5 seconds too often?

function getServiceControlStats() { 
  useServiceControlStats(serviceControlUrl.value)
  failedHeartBeats.value = stats.failing_endpoints
  failedMessages.value = stats.number_of_failed_messages
  failedCustomChecks.value = stats.number_of_failed_checks
  isSCConnecting.value = isServiceControlConnecting.value
  isSCConnected.value = isServiceControlConnected.value
  scConnectedAtLeastOnce.value = serviceControlConnectedAtLeastOnce.value  
}
function getServiceControlMonitoringStats() { 
  useServiceControlMonitoringStats(monitoringUrl.value)  
  isSCMonitoringConnecting.value = isServiceControlMonitoringConnecting.value
  isSCMonitoringConnected.value = isServiceControlMonitoringConnected.value
}

provide(key_Failedheartbeats, failedHeartBeats)
provide(key_Failedmessages, failedMessages)
provide(key_Failedcustomchecks, failedCustomChecks)
provide(key_UnableToConnectToServiceControl, unableToConnectToServiceControl)
provide(key_UnableToConnectToMonitoring, unableToConnectToMonitoring)
provide(key_IsSCConnecting, isSCConnecting)
provide(key_IsSCConnected, isSCConnected)
provide(key_ScConnectedAtLeastOnce, scConnectedAtLeastOnce)
provide(key_UpdateConnections, updateConnections)

provide(key_IsMonitoringEnabled, isMonitoringEnabled)
provide(key_IsSCMonitoringConnected, isSCMonitoringConnected)
provide(key_IsSCMonitoringConnecting, isSCMonitoringConnecting)


let scVersion = ref(null)
let newSCVersion = ref(null)
let newSCVersionLink = ref(null)
let newSCVersionNumber = ref(null)
let spVersion = ref(null)
let newSPVersion = ref(null)
let newSPVersionLink = ref(null)
let newSPVersionNumber = ref(null)
let monitoringVersion = ref(null)
let newmonitoringVersion = ref(null)
let newmonitoringVersionLink = ref(null)
let newmonitoringVersionNumber = ref(null)
setInterval( ()=> getServiceControlVersions(), 5000)

function getServiceControlVersions() {
  useServiceControlVersion(serviceControlUrl.value, monitoringUrl.value)
  scVersion.value = environment.sc_version
  newSCVersion.value = newVersions.newSCVersion.newscversion
  newSCVersionLink.value = newVersions.newSCVersion.newscversionlink
  newSCVersionNumber.value = newVersions.newSCVersion.newscversionnumber
  
  spVersion.value = environment.sp_version
  newSPVersion.value = newVersions.newSPVersion.newspversion
  newSPVersionLink.value = newVersions.newSPVersion.newspversionlink
  newSPVersionNumber.value = newVersions.newSPVersion.newspversionnumber  

  monitoringVersion.value = environment.monitoring_version
  newmonitoringVersion.value = newVersions.newMVersion.newmversion
  newmonitoringVersionLink.value = newVersions.newMVersion.newmversionlink
  newmonitoringVersionNumber.value = newVersions.newMVersion.newmversionnumber  
}
provide(key_SCVersion, scVersion)
provide(key_NewSCVersion, newSCVersion)
provide(key_NewSCVersionLink, newSCVersionLink)
provide(key_NewSCVersionNumber, newSCVersionNumber)
provide(key_SPVersion, spVersion)
provide(key_NewSPVersion, newSPVersion)
provide(key_NewSPVersionLink, newSPVersionLink)
provide(key_NewSPVersionNumber, newSPVersionNumber)
provide(key_MonitoringVersion, monitoringVersion)
provide(key_NewMonitoringVersion, newmonitoringVersion)
provide(key_NewMonitoringVersionLink, newmonitoringVersionLink)
provide(key_NewMonitoringVersionNumber, newmonitoringVersionNumber)

</script>

<template>
  <Header />
  <RouterView />
  <Footer />
</template>
