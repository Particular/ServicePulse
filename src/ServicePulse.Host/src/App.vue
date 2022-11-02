<script setup>
import { ref, provide } from "vue";
import { RouterView, useRoute } from "vue-router";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import { useServiceControlUrls } from "./composables/serviceControlUrls.js";
import { useServiceControl } from "./composables/serviceControl.js";

const { serviceControlUrl, monitoringUrl } = useServiceControlUrls(useRoute())
const failedHeartBeats = ref(0)
const failedMessages = ref(0)
const failedCustomChecks = ref(0)

setInterval(() => {
  const { failedHeartBeatsCount, failedMessagesCount, failedCustomChecksCount } = useServiceControl(serviceControlUrl.value, monitoringUrl.value)

  failedHeartBeats.value = failedHeartBeatsCount.value
  failedMessages.value = failedMessagesCount.value
  failedCustomChecks.value = failedCustomChecksCount.value
}, 5000)

provide("failedheartbeats", failedHeartBeats)
provide("failedmessages", failedMessages)
provide("failedcustomchecks", failedCustomChecks)
</script>

<template>
  <Header />
  <RouterView />
  <Footer />

</template>

<style scoped>

</style>
