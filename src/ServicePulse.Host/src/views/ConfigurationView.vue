<script setup>
import { ref, computed, inject } from 'vue'
import Connections from '../components/configuration/Connections.vue';
import License from '../components/configuration/License.vue';
import EndpointConnection from '../components/configuration/EndpointConnection.vue';
import HealthCheckNotifications from '../components/configuration/HealthCheckNotifications.vue';
import RetryRedirects from '../components/configuration/RetryRedirects.vue';
import { useLicenseWarningLevel } from '../composables/license.js'
import Exclamation from '../components/Exclamation.vue'
import { key_UnableToConnectToServiceControl, key_UnableToConnectToMonitoring, key_IsSCConnected, key_ScConnectedAtLeastOnce, key_License, key_IsExpired } from "./../composables/keys.js"

const unableToConnectToServiceControl = inject(key_UnableToConnectToServiceControl)
const unableToConnectToMonitoring = inject(key_UnableToConnectToMonitoring)
const isSCConnected = inject(key_IsSCConnected)
const scConnectedAtLeastOnce = inject(key_ScConnectedAtLeastOnce)
const isExpired = inject(key_IsExpired)
const license = inject(key_License)

const routes = {
  '/license': License,
  '/health-check-notifications': HealthCheckNotifications,
  '/retry-redirects': RetryRedirects,
  '/connections': Connections,
  '/endpoint-connection': EndpointConnection,
}

const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

function subIsActive(subPath) {
  return currentPath.value === subPath
}

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || License
})
</script>

<template>  
  <h1>Configuration</h1>
  <div class="row">
    <div class="col-sm-12">
        <div class="tabs">
          <h5 :class="{active: subIsActive('#/license') || subIsActive(''), disabled:  (!isSCConnected && !scConnectedAtLeastOnce)}">
            <a href="#/license">License</a>
            <Exclamation :type="useLicenseWarningLevel(license.license_status)" />
          </h5>
          <h5 v-if="!isExpired" :class="{active: subIsActive('#/health-check-notifications'), disabled:  (!isSCConnected && !scConnectedAtLeastOnce)}"><a href="#/health-check-notifications">Health Check Notifications</a></h5>
          <h5 v-if="!isExpired" :class="{active: subIsActive('#/retry-redirects'), disabled:  (!isSCConnected && !scConnectedAtLeastOnce)}"><a href="#/retry-redirects">Retry Redirects</a></h5>
          <h5 v-if="!isExpired" :class="{active: subIsActive('#/connections')}">
            <a href="#/connections">
              Connections
              <span v-if="unableToConnectToServiceControl || unableToConnectToMonitoring"><i class="fa fa-exclamation-triangle"></i></span>
            </a>
          </h5>
          <h5 v-if="!isExpired" :class="{active: subIsActive('#/endpoint-connection'), disabled:  (!isSCConnected && !scConnectedAtLeastOnce)}"><a href="#/endpoint-connection">Endpoint Connection</a></h5>
          <component :is="currentView" />
        </div>
    </div>
  </div>  
</template>

<style>
</style>
