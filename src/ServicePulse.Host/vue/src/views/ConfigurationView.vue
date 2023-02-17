<script setup>
import { ref, computed, watch, onMounted } from "vue";
import PlatformConnections from "../components/configuration/PlatformConnections.vue";
import PlatformLicense from "../components/configuration/PlatformLicense.vue";
import EndpointConnection from "../components/configuration/EndpointConnection.vue";
import HealthCheckNotifications from "../components/configuration/HealthCheckNotifications.vue";
import RetryRedirects from "../components/configuration/RetryRedirects.vue";
import { licenseStatus } from "../composables/serviceLicense.js";
import { connectionState, monitoringConnectionState } from "../composables/serviceServiceControl";
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
        <div class="nav tabs">
          <h5 :class="{ active: subIsActive('#license') || subIsActive(''), disabled: !connectionState.connected && !connectionState.connectedRecently, }" class="nav-item">
            <a href="#license">License</a>
            <exclamation-mark :type="licenseStatus.warningLevel" />
          </h5>
          <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#health-check-notifications'), disabled: !connectionState.connected && !connectionState.connectedRecently }" class="nav-item">
            <a href="#health-check-notifications">Health Check Notifications</a>
          </h5>
          <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#retry-redirects'), disabled: !connectionState.connected && !connectionState.connectedRecently }" class="nav-item">
            <a href="#retry-redirects"
              >Retry Redirects ({{ redirectCount }})
            </a>
          </h5>
          <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#connections') }" class="nav-item">
            <a href="#connections">
              Connections
              <template v-if="connectionState.unableToConnect || monitoringConnectionState.unableToConnect">
                <span><i class="fa fa-exclamation-triangle"></i></span>
              </template>
            </a>
          </h5>
          <h5 v-if="!licenseStatus.isExpired" :class="{ active: subIsActive('#endpoint-connection'), disabled: !connectionState.connected && !connectionState.connectedRecently }" class="nav-item">
            <a href="#endpoint-connection">Endpoint Connection</a>
          </h5>
        </div>
      </div>
    </div>
    <component :is="currentView" v-on="currentEvents" />
  </div>
</template>

<style>
.tabs-config-snippets .tabs {
  margin: 30px 0 15px;
}

.tabs-config-snippets highlight {
  margin-bottom: 20px;
  display: block;
}

.tabs-config-snippets p {
  font-size: 16px;
  color: #181919;
}

.tabs-config-snippets .alert {
  margin-bottom: 15px;
}

.tabs-config-snippets .alert li {
  margin-bottom: 0;
}

.btn-toolbar {
  padding: 12px 0 0;
  margin-left: 0;
}

div.btn-toolbar, div.form-inline {
  margin-bottom: 12px;
}

.btn-toolbar button:last-child {
  margin-top: 0 !important;
}

.pa-redirect-source {
  background-image: url('@/assets/redirect-source.svg');
  background-position: center;
  background-repeat: no-repeat;
}

.pa-redirect-small {
  position: relative;
  top: 1px;
  height: 14px;
  width: 14px;
}

.pa-redirect-large {
  height: 24px;
}

.pa-redirect-destination {
  background-image: url('@/assets/redirect-destination.svg');
  background-position: center;
  background-repeat: no-repeat;
}
</style>