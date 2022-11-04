<script setup>
import { ref, provide, computed, onMounted } from "vue";
import { RouterView, useRoute } from "vue-router";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import { useServiceControlUrls } from "./composables/serviceControlUrls.js";
import { useServiceControl, failedCustomChecksCount, failedHeartBeatsCount, failedMessagesCount, isServiceControlConnecting, isServiceControlConnected, serviceControlConnectedAtLeastOnce } from "./composables/serviceControl.js";
import { useLicense, useIsPlatformExpired, useIsPlatformTrialExpired, useIsInvalidDueToUpgradeProtectionExpired, currentLicense } from "./composables/license.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls(useRoute())
provide("serviceControlUrl", serviceControlUrl)

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


setInterval( ()=> getServiceControl(), 5000) //NOTE is 5 seconds too often?

provide("failedheartbeats", failedHeartBeats)
provide("failedmessages", failedMessages)
provide("failedcustomchecks", failedCustomChecks)
provide("unableToConnectToServiceControl", unableToConnectToServiceControl)
provide("unableToConnectToMonitoring", unableToConnectToMonitoring)
provide("isSCConnecting", isSCConnecting)
provide("isSCConnected", isSCConnected)
provide("scConnectedAtLeastOnce", scConnectedAtLeastOnce)

provide("license", license)
provide("isPlatformExpired", isPlatformExpired)
provide("isPlatformTrialExpired", isPlatformTrialExpired)
provide("isInvalidDueToUpgradeProtectionExpired", isInvalidDueToUpgradeProtectionExpired)
provide("isExpired", isExpired)

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
