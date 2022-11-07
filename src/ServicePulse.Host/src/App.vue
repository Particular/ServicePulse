<script setup>
import { ref, provide, computed, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import { key_ServiceControlUrl, key_MonitoringUrl, key_UnableToConnectToServiceControl, key_UnableToConnectToMonitoring, key_IsSCConnecting, key_IsSCConnected, key_ScConnectedAtLeastOnce, key_UpdateConnections, key_Failedheartbeats, key_Failedmessages, key_Failedcustomchecks, key_License, key_IsPlatformExpired, key_IsPlatformTrialExpired, key_IsInvalidDueToUpgradeProtectionExpired, key_IsExpired } from "./composables/keys.js"
import { useServiceControlUrls, updateServiceControlUrls } from "./composables/serviceControlUrls.js";
import { useServiceControl, failedCustomChecksCount, failedHeartBeatsCount, failedMessagesCount, isServiceControlConnecting, isServiceControlConnected, serviceControlConnectedAtLeastOnce } from "./composables/serviceControl.js";
import { useLicense, useIsPlatformExpired, useIsPlatformTrialExpired, useIsInvalidDueToUpgradeProtectionExpired, currentLicense } from "./composables/license.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls(useRoute())
provide(key_ServiceControlUrl, serviceControlUrl)
provide(key_MonitoringUrl, monitoringUrl)

let isSCConnecting = ref(true)
let isSCConnected = ref(false)
let scConnectedAtLeastOnce = ref(false)
const unableToConnectToServiceControl = computed(() => {
  return isSCConnecting.value ? false : !isSCConnected.value
})  

const unableToConnectToMonitoring = ref(false)
let failedHeartBeats = ref(null)
let failedMessages = ref(null)
let failedCustomChecks = ref(null)

useLicense(serviceControlUrl.value)
const license = ref(currentLicense)
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

function updateConnections(serviceControlUrl, monitoringUrl) {
  updateServiceControlUrls(useRoute(), serviceControlUrl, monitoringUrl)
}
provide(key_UpdateConnections, updateConnections)

setInterval( ()=> getServiceControl(), 5000) //NOTE is 5 seconds too often?

onMounted(() => {
  getServiceControl()
})

provide(key_Failedheartbeats, failedHeartBeats)
provide(key_Failedmessages, failedMessages)
provide(key_Failedcustomchecks, failedCustomChecks)
provide(key_UnableToConnectToServiceControl, unableToConnectToServiceControl)
provide(key_UnableToConnectToMonitoring, unableToConnectToMonitoring)
provide(key_IsSCConnecting, isSCConnecting)
provide(key_IsSCConnected, isSCConnected)
provide(key_ScConnectedAtLeastOnce, scConnectedAtLeastOnce)

provide(key_License, license)
provide(key_IsPlatformExpired, isPlatformExpired)
provide(key_IsPlatformTrialExpired, isPlatformTrialExpired)
provide(key_IsInvalidDueToUpgradeProtectionExpired, isInvalidDueToUpgradeProtectionExpired)
provide(key_IsExpired, isExpired)

function getServiceControl() { 
  useServiceControl(serviceControlUrl.value, monitoringUrl.value)
  failedHeartBeats.value = failedHeartBeatsCount.value
  failedMessages.value = failedMessagesCount.value
  failedCustomChecks.value = failedCustomChecksCount.value
  isSCConnecting.value = isServiceControlConnecting.value
  isSCConnected.value = isServiceControlConnected.value
  scConnectedAtLeastOnce.value = serviceControlConnectedAtLeastOnce.value  
}

</script>

<template>
  <Header />
  <RouterView />
  <Footer />
</template>
