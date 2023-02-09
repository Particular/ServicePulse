<script setup>
import { ref, computed, watch, onMounted } from "vue";
import FailedMessageGroups from "../components/failedmessages/FailedMessageGroups.vue";
import AllFailedMessages from "../components/failedmessages/AllFailedMessages.vue";
import DeletedMessageGroups from "../components/failedmessages/DeletedMessageGroups.vue";
import AllDeletedMessages from "../components/failedmessages/AllDeletedMessages.vue";
import LicenseExpired from "../components/LicenseExpired.vue";
/* import ServiceControlNotAvailable from "../components/ServiceControlNotAvailable.vue"; */
import { licenseStatus } from "./../composables/serviceLicense.js";
import { connectionState, monitoringConnectionState } from "../composables/serviceServiceControl";

const routes = {
  "failed-message-groups": {
    component: FailedMessageGroups,
    title: "Failed Message Groups",
  },
  "all-failed-messages": {
    component: AllFailedMessages,
    title: "All Failed Messages",
  },
  "deleted-message-groups": {
    component: DeletedMessageGroups,
    title: "Deleted Message Groups",
  },
  "all-deleted-messages": {
    component: AllDeletedMessages,
    title: "All Deleted Messages",
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

            <!--All Failed Messages-->
            <h5
                v-if="!licenseStatus.isExpired"
                :class="{
                    active: subIsActive('#all-failed-messages'),
                    disabled:
                        !connectionState.connected &&
                        !connectionState.connectedRecently,
                }"
            >
              <a href="#all-failed-messages">All Failed Messages</a>
            </h5>

            <!--Deleted Message Group-->
            <h5
                v-if="!licenseStatus.isExpired"
                :class="{
                    active: subIsActive('#deleted-message-groups'),
                    disabled:
                        !connectionState.connected &&
                        !connectionState.connectedRecently,
                }"
            >
              <a href="#deleted-message-groups">
                Deleted Message Groups ({{ redirectCount }})
              </a>
            </h5>

            <!--All Deleted Messages-->
            <h5
                v-if="!licenseStatus.isExpired"
                :class="{ 
                    active: subIsActive('#all-deleted-messages'),
                    disabled:
                        !connectionState.connected &&
                        !connectionState.connectedRecently,
                }"
            >
                <a href="#all-deleted-messages">
                    All Deleted Messages
                    <template
                        v-if="
                            connectionState.unableToConnect ||
                            monitoringConnectionState.unableToConnect
                        "
                    >
                        <span><i class="fa fa-exclamation-triangle"></i></span>
                    </template>
                </a>
            </h5>
          </div>
        </div>
      </div>
      <component :is="currentView" v-on="currentEvents" />
    </div>
  </template>
</template>

<style></style>
