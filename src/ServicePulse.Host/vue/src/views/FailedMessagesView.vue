<script setup>
import { ref, computed, watch, onMounted } from "vue";
import FailedMessageGroups from "../components/failedmessages/FailedMessageGroups.vue";
import LicenseExpired from "../components/LicenseExpired.vue";
/* import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue"; */
import { licenseStatus } from "./../composables/serviceLicense.js";
import { connectionState } from "../composables/serviceServiceControl";

const routes = {
  "failed-message-groups": {
    component: FailedMessageGroups,
    title: "Failed Message Groups",
  },
};
const currentPath = ref(window.location.hash);
const redirectCount = ref(0);
function updateRedirectCount(newCount) {
  redirectCount.value = newCount;
}
window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});
function subIsActive(subPath) {
  return currentPath.value === subPath;
}
const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || "/"]
    ? routes[currentPath.value.slice(1) || "/"].component
    : FailedMessageGroups;
});
const currentEvents = ref({});
watch(currentPath, async (newValue) => {
  setupEvents(newValue);
  if (routes[currentPath.value.slice(1) || "/"]) {
    document.title =
      routes[currentPath.value.slice(1) || "/"].title +
      " - Configuration � ServicePulse";
  }
});
function setupEvents(newPath) {
  if (newPath === "#retry-redirects") {
    currentEvents.value = { redirectCountUpdated: updateRedirectCount };
  } else {
    currentEvents.value = {};
  }
}
onMounted(() => {
  const path = currentPath.value.slice(1) || "/";
  if (
    path === "/" &&
    !connectionState.connected &&
    !connectionState.connectedRecently
  ) {
    window.location.hash = "connections";
  }
  setupEvents(currentPath.value);
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <h1>Failed Messages</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="tabs">
            <!--Failed Message Groups-->
            <h5
              :class="{
                active:
                  subIsActive('#failed-message-groups') || subIsActive(''),
                disabled:
                  !connectionState.connected &&
                  !connectionState.connectedRecently,
              }"
            >
              <a href="#failed-message-groups">Failed Message Groups</a>
              <exclamation-mark :type="licenseStatus.warningLevel" />
            </h5>
          </div>
        </div>
      </div>
      <component :is="currentView" v-on="currentEvents" />
    </div>
  </template>
</template>

<style></style>
