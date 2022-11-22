<script setup>
import { ref, computed, inject, watch, onMounted } from "vue";
import PlatformConnections from "../components/configuration/PlatformConnections.vue";
import PlatformLicense from "../components/configuration/PlatformLicense.vue";
import EndpointConnection from "../components/configuration/EndpointConnection.vue";
import HealthCheckNotifications from "../components/configuration/HealthCheckNotifications.vue";
import RetryRedirects from "../components/configuration/RetryRedirects.vue";
import { useLicenseWarningLevel } from "../composables/serviceLicense.js";
import ExclamationMark from "../components/ExclamationMark.vue";
import {
  key_UnableToConnectToServiceControl,
  key_UnableToConnectToMonitoring,
  key_IsSCConnected,
  key_ScConnectedAtLeastOnce,
  key_License,
  key_IsExpired,
} from "./../composables/keys.js";

const unableToConnectToServiceControl = inject(
  key_UnableToConnectToServiceControl
);
const unableToConnectToMonitoring = inject(key_UnableToConnectToMonitoring);
const isSCConnected = inject(key_IsSCConnected);
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce);
const isExpired = inject(key_IsExpired);
const license = inject(key_License);

const routes = {
  license: PlatformLicense,
  "health-check-notifications": HealthCheckNotifications,
  "retry-redirects": RetryRedirects,
  connections: PlatformConnections,
  "endpoint-connection": EndpointConnection,
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
  return routes[currentPath.value.slice(1) || "/"] || PlatformLicense;
});

const currentEvents = ref({});
watch(currentPath, async (newValue) => {
  setupEvents(newValue);
});

function setupEvents(newPath) {
  if (newPath === "#retry-redirects") {
    currentEvents.value = { redirectCountUpdated: updateRedirectCount };
  } else {
    currentEvents.value = {};
  }
}

onMounted(() => {
  setupEvents(currentPath.value);
});
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-sm-12">
        <h1>Configuration</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="tabs">
          <h5
            :class="{
              active: subIsActive('#license') || subIsActive(''),
              disabled: !isSCConnected && !scConnectedAtLeastOnce,
            }"
          >
            <a href="#license">License</a>
            <exclamation-mark
              :type="useLicenseWarningLevel(license.license_status)"
            />
          </h5>
          <h5
            v-if="!isExpired"
            :class="{
              active: subIsActive('#health-check-notifications'),
              disabled: !isSCConnected && !scConnectedAtLeastOnce,
            }"
          >
            <a href="#health-check-notifications">Health Check Notifications</a>
          </h5>
          <h5
            v-if="!isExpired"
            :class="{
              active: subIsActive('#retry-redirects'),
              disabled: !isSCConnected && !scConnectedAtLeastOnce,
            }"
          >
            <a href="#retry-redirects"
              >Retry Redirects ({{ redirectCount }})
            </a>
          </h5>
          <h5
            v-if="!isExpired"
            :class="{ active: subIsActive('#connections') }"
          >
            <a href="#connections">
              Connections
              <template
                v-if="
                  unableToConnectToServiceControl || unableToConnectToMonitoring
                "
              >
                <span><i class="fa fa-exclamation-triangle"></i></span>
              </template>
            </a>
          </h5>
          <h5
            v-if="!isExpired"
            :class="{
              active: subIsActive('#endpoint-connection'),
              disabled: !isSCConnected && !scConnectedAtLeastOnce,
            }"
          >
            <a href="#endpoint-connection">Endpoint Connection</a>
          </h5>
        </div>
      </div>
    </div>    
    <component :is="currentView" v-on="currentEvents" />    
  </div>
</template>

<style></style>
