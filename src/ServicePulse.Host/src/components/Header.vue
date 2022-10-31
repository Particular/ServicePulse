<script setup>
import { RouterLink } from "vue-router";
import { ref, computed } from 'vue'

/* const currentPath = ref(window.location.hash)

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
  alert(currentPath.value)
})

const currentView = computed(() => {
  return currentPath.value.slice(1) || '/'
}) */
</script>

<template>
    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="#/">
            <img alt="Service Pulse" src="@/assets/logo.svg">
          </a>
        </div>

        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/configuration">Configuration</RouterLink>
        <!--   WORK IN PROGRESS
        <div id="navbar" class="collapse navbar-collapse navbar-right navbar-inverse">
          <ul class="nav navbar-nav navbar-inverse">
            <li :class="{ active: currentView === '#/' }">            
              <i class="fa fa-dashboard icon-white"></i>
              <span class="navbar-label">
                <RouterLink to="/#">Dashboard</RouterLink>
              </span>
            </li>
            <li :class="{ active: currentView === '#/endpoints' }">            
              <a href="#/endpoints">
                <i class="fa fa-heartbeat icon-white"></i>
                <span class="navbar-label">Heartbeats</span>
              </a>
            </li>
            <li :class="{ active: currentView === '#/monitoring' || currentView === '#/monitoring/endpoint' }">            
              <a href="/monitoring">
                <i class="fa pa-monitoring icon-white"></i>
                <span class="navbar-label">Monitoring</span>
              </a>
            </li>
            <li :class="{ active: currentView === '#/failed-messages/groups' || currentView === '#/failed-messages/all' || currentView === '#/failed-messages/archived' || currentView === '#/failed-messages/pending-retries' }">            
              <a href="#/failed-messages/groups">
                <i class="fa fa-envelope icon-white"></i>
                <span class="navbar-label">Failed Messages</span>
              </a>
            </li>
            <li :class="{ active: currentView === '#/custom-checks' }">            
              <a href="#/custom-checks">
                <i class="fa fa-check icon-white"></i>
                <span class="navbar-label">Custom Checks</span>
              </a>
            </li>
            <li :class="{ active: currentView === '#/events' }">            
              <a href="#/events">
                <i class="fa fa-list-ul icon-white"></i>
                <span class="navbar-label">Events</span>
              </a>
            </li>
            <li :class="{ active: currentView === '#/configuration' }">            
                <i class="fa fa-cog icon-white"></i>
                <span class="navbar-label">
                  <RouterLink to="#/configuration">Configuration</RouterLink>
                </span>
            </li>
            <li>
              <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
                <i class="fa fa-comment"></i>
                <span class="navbar-label">Feedback</span>
              </a>
            </li>
          </ul>
        </div>-->
      </div>
    </nav>  
</template>

<style>
</style>
