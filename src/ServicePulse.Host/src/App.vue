<script setup>
import { ref, provide, computed, onMounted  } from "vue";
import { RouterView, useRoute } from "vue-router";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import { useServiceControlUrls } from "./composables/serviceControlUrls.js";
import { useServiceControl } from "./composables/serviceControl.js";
import { useLicense, useIsPlatformExpired, useIsPlatformTrialExpired, useIsInvalidDueToUpgradeProtectionExpired } from "./composables/license.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls(useRoute())
provide("serviceControlUrl", serviceControlUrl)

const isSCConnecting = ref(true)
const isSCConnected = ref(false)
const scConnectedAtLeastOnce = ref(false)
const unableToConnectToServiceControl = computed(() => {
  return isSCConnecting.value ? false : !isSCConnected.value
})  

//const unableToConnectToMonitoring = ref(false)
const failedHeartBeats = ref(0)
const failedMessages = ref(0)
const failedCustomChecks = ref(0)

const license = ref(useLicense(serviceControlUrl.value))
const isPlatformExpired = computed(useIsPlatformExpired(license.value.license_status))
const isPlatformTrialExpired = computed(useIsPlatformTrialExpired(license.value.license_status))
const isInvalidDueToUpgradeProtectionExpired = computed(useIsInvalidDueToUpgradeProtectionExpired(license.value.license_status))

setInterval( ()=> getServiceControl(), 5000) //NOTE is 5 seconds too often?

onMounted(() => {
  getServiceControl()
})

provide("failedheartbeats", failedHeartBeats)
provide("failedmessages", failedMessages)
provide("failedcustomchecks", failedCustomChecks)
provide("unableToConnectToServiceControl", unableToConnectToServiceControl)
provide("isSCConnecting", isSCConnecting)
provide("isSCConnected", isSCConnected)
provide("scConnectedAtLeastOnce", scConnectedAtLeastOnce)

provide("license", license)
provide("isPlatformExpired", isPlatformExpired)
provide("isPlatformTrialExpired", isPlatformTrialExpired)
provide("isInvalidDueToUpgradeProtectionExpired", isInvalidDueToUpgradeProtectionExpired)

function getServiceControl() {
  const { failedHeartBeatsCount, failedMessagesCount, failedCustomChecksCount, isServiceControlConnecting, isServiceControlConnected, serviceControlConnectedAtLeastOnce } = useServiceControl(serviceControlUrl.value, monitoringUrl.value)

  failedHeartBeats.value = failedHeartBeatsCount.value
  failedMessages.value = failedMessagesCount.value
  failedCustomChecks.value = failedCustomChecksCount.value
  isSCConnecting.value = isServiceControlConnecting.value
  isSCConnected.value = isServiceControlConnected.value
  scConnectedAtLeastOnce.value = serviceControlConnectedAtLeastOnce.value
}


/* function getLicense() {
  const licenseValue = useLicense(serviceControlUrl.value)

  license.value = licenseValue.value  
} */

</script>

<template>
  <Header />
  <RouterView />
  <Footer />

</template>

<style scoped>

</style>
