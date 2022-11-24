<script setup>
import { ref, computed, watch, onMounted } from "vue";
import PlatformConnections from "../components/configuration/PlatformConnections.vue";
import PlatformLicense from "../components/configuration/PlatformLicense.vue";
import EndpointConnection from "../components/configuration/EndpointConnection.vue";
import HealthCheckNotifications from "../components/configuration/HealthCheckNotifications.vue";
import RetryRedirects from "../components/configuration/RetryRedirects.vue";
import { useLicenseStatus } from "../composables/serviceLicense.js";
import {
  connectionState,
  monitoringConnectionState,
} from "../composables/serviceServiceControl";
import ExclamationMark from "../components/ExclamationMark.vue";

const routes = {
  license: { component: PlatformLicense, title: "License" },
  "health-check-notifications": {
    component: HealthCheckNotifications,
    title: "Health Check Notifications",
  },
  "retry-redirects": { component: RetryRedirects, title: "Retry Redirects" },
  connections: {
    component: PlatformConnections,
    title: "Platform Connections",
  },
  "endpoint-connection": {
    component: EndpointConnection,
    title: "Endpoint Connetion",
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
    : PlatformLicense;
});

const currentEvents = ref({});
watch(currentPath, async (newValue) => {
  setupEvents(newValue);
  if (routes[currentPath.value.slice(1) || "/"]) {
    document.title =
      routes[currentPath.value.slice(1) || "/"].title +
      " - Configuration • ServicePulse";
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
              disabled:
                !connectionState.connected &&
                !connectionState.connectedRecently,
            }"
          >
            <a href="#license">License</a>
            <exclamation-mark :type="useLicenseStatus.warningLevel" />
          </h5>
          <h5
            v-if="!useLicenseStatus.isExpired"
            :class="{
              active: subIsActive('#health-check-notifications'),
              disabled:
                !connectionState.connected &&
                !connectionState.connectedRecently,
            }"
          >
            <a href="#health-check-notifications">Health Check Notifications</a>
          </h5>
          <h5
            v-if="!useLicenseStatus.isExpired"
            :class="{
              active: subIsActive('#retry-redirects'),
              disabled:
                !connectionState.connected &&
                !connectionState.connectedRecently,
            }"
          >
            <a href="#retry-redirects"
              >Retry Redirects ({{ redirectCount }})
            </a>
          </h5>
          <h5
            v-if="!useLicenseStatus.isExpired"
            :class="{ active: subIsActive('#connections') }"
          >
            <a href="#connections">
              Connections
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
          <h5
            v-if="!useLicenseStatus.isExpired"
            :class="{
              active: subIsActive('#endpoint-connection'),
              disabled:
                !connectionState.connected &&
                !connectionState.connectedRecently,
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
