<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { licenseStatus } from "./../composables/serviceLicense.js";
import { stats, connectionState } from "../composables/serviceServiceControl";
import FailedMessageGroups from "../components/failedmessages/FailedMessageGroups.vue";
import AllFailedMessages from "../components/failedmessages/AllFailedMessages.vue";
import DeletedMessageGroups from "../components/failedmessages/DeletedMessageGroups.vue";
import AllDeletedMessages from "../components/failedmessages/AllDeletedMessages.vue";
import PendingRetries from "../components/failedmessages/PendingRetries.vue";
import LicenseExpired from "../components/LicenseExpired.vue";

const router = useRouter();
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
  "pending-retries": {
    component: PendingRetries,
    title: "Pending Retries",
  },
};
const currentPath = ref(window.location.hash);
//const redirectCount = ref(0);
window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});
function subIsActive(subPath) {
  return currentPath.value === subPath;
}
const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || "/"] ? routes[currentPath.value.slice(1) || "/"].component : FailedMessageGroups;
});
const currentEvents = ref({});
watch(currentPath, async () => {
  // setupEvents(newValue);
  if (routes[currentPath.value.slice(1) || "/"]) {
    document.title = routes[currentPath.value.slice(1) || "/"].title + " - Configuration � ServicePulse";
  }
});

function changeRoute($event, routeHash) {
  $event.preventDefault();
  currentPath.value = routeHash;
  router.push({ hash: routeHash });
}

onMounted(() => {
  const path = currentPath.value.slice(1) || "/";
  if (path === "/" && !connectionState.connected && !connectionState.connectedRecently) {
    /* empty */
  }
});
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="tabs">
            <!--Failed Message Groups-->
            <h5 :class="{ active: subIsActive('#failed-message-groups') || subIsActive(''), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <a href="/failed-messages#failed-message-groups" @click="changeRoute($event, '#failed-message-groups')">
                Failed Message Groups
                <span v-show="stats.number_of_failed_messages === 0"> (0) </span>
              </a>
              <span v-if="stats.number_of_failed_messages !== 0" title="There's varying numbers of failed message groups depending on group type" class="badge badge-important">!</span>
            </h5>

            <!--All Failed Messages-->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#all-failed-messages'), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <a href="/failed-messages#all-failed-messages" @click="changeRoute($event, '#all-failed-messages')">All Failed Messages </a>
              <span v-if="stats.number_of_failed_messages !== 0" class="badge badge-important">{{ stats.number_of_failed_messages }}</span>
            </h5>

            <!--Deleted Message Group-->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#deleted-message-groups'), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <a href="/failed-messages#deleted-message-groups" @click="changeRoute($event, '#deleted-message-groups')">Deleted Message Groups </a>
              <span v-if="stats.number_of_archived_messages !== 0" title="There's varying numbers of deleted message groups depending on group type" class="badge badge-important">!</span>
            </h5>

            <!--All Deleted Messages-->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#all-deleted-messages'), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <a href="/failed-messages#all-deleted-messages" @click="changeRoute($event, '#all-deleted-messages')">All Deleted Messages </a>
              <span v-if="stats.number_of_archived_messages !== 0" class="badge badge-important">{{ stats.number_of_archived_messages }}</span>
            </h5>

            <!--All Pending Retries -->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#pending-retries'), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <a href="/failed-messages#pending-retries" @click="changeRoute($event, '#pending-retries')">Pending Retries </a>
              <span v-if="stats.number_of_pending_retries !== 0" class="badge badge-important">{{ stats.number_of_pending_retries }}</span>
            </h5>
          </div>
        </div>
      </div>
      <component :is="currentView" v-on="currentEvents" />
    </div>
  </template>
</template>

<style></style>
