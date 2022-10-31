<script setup>
import { ref, computed } from 'vue'
import Connections from '../components/configuration/Connections.vue';
import License from '../components/configuration/License.vue';
import EndpointConnection from '../components/configuration/EndpointConnection.vue';
import HealthCheckNotifications from '../components/configuration/HealthCheckNotifications.vue';
import RetryRedirects from '../components/configuration/RetryRedirects.vue';

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

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || License
})
</script>

<template>
  <div class="container">
    <h1>Configuration</h1>
    <a href="#/license">License</a> |
    <a href="#/health-check-notifications">Health Check Notifications</a> |
    <a href="#/retry-redirects">Retry Redirects</a> |
    <a href="#/connections">Connections</a> |
    <a href="#/endpoint-connection">Endpoint Connection</a>
    <component :is="currentView" />
  </div>  
</template>

<style>
</style>
