<script setup>
import { inject } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { key_Failedheartbeats,  key_Failedmessages, key_Failedcustomchecks } from "./../composables/keys.js"

const failedheartbeats = inject(key_Failedheartbeats)
const failedmessages = inject(key_Failedmessages)
const failedcustomchecks = inject(key_Failedcustomchecks)

function subIsActive(input, exact) {
  const paths = Array.isArray(input) ? input : [input];
  const route = useRoute()
  return paths.some( path => {
    return exact ? route.path.endsWith(path) : route.path.indexOf(path) === 0; // current path starts with this path string
  })
}
</script>

<template>
    <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container-fluid">
        <div class="navbar-header">
          <a class="navbar-brand" href="/">
            <img alt="Service Pulse" src="@/assets/logo.svg">
          </a>
        </div>
        
        <div id="navbar" class="collapse navbar-collapse navbar-right navbar-inverse">
          <ul class="nav navbar-nav navbar-inverse">
            <li :class="{ active: subIsActive('/', true) }">
              <RouterLink to="/">
                <i class="fa fa-dashboard icon-white"></i>
                  <span class="navbar-label">Dashboard</span>
                </RouterLink>
            </li>
            <li :class="{ active: subIsActive('/endpoints') }">
              <a href="/endpoints">
                <i class="fa fa-heartbeat icon-white"></i>
                <span class="navbar-label">Heartbeats</span>
                <span v-if="failedheartbeats > 0" class="badge badge-important ">{{failedheartbeats}}</span>
              </a>
            </li>
            <li :class="{ active: (subIsActive('/monitoring') || subIsActive('/monitoring/endpoint')) }">
              <a href="/monitoring">
                <i class="fa pa-monitoring icon-white"></i>
                <span class="navbar-label">Monitoring</span>
              </a>
            </li>
            <li :class="{ active: subIsActive('/failed-messages/groups') || subIsActive('/failed-messages/all') || subIsActive('/failed-messages/archived') || subIsActive('/failed-messages/pending-retries') }">            
              <a href="/failed-messages/groups">
                <i class="fa fa-envelope icon-white"></i>
                <span class="navbar-label">Failed Messages</span>
                <span v-if="failedmessages > 0" class="badge badge-important ">{{failedmessages}}</span>
              </a>
            </li>
            <li :class="{ active: subIsActive('/custom-checks') }">
              <a href="/custom-checks">
                <i class="fa fa-check icon-white"></i>
                <span class="navbar-label">Custom Checks</span>
                <span v-if="failedcustomchecks > 0" class="badge badge-important ">{{failedcustomchecks}}</span>
              </a>
            </li>
            <li :class="{ active: subIsActive('/events') }">
              <a href="/events">
                <i class="fa fa-list-ul icon-white"></i>
                <span class="navbar-label">Events</span>
              </a>
            </li>
            <li :class="{ active: subIsActive('/configuration') }">
                  <RouterLink to="/configuration" exact>
                    <i class="fa fa-cog icon-white"></i>
                    <span class="navbar-label">Configuration</span>
                  </RouterLink>                
            </li>
            <li>
              <a class="btn-feedback" href="https://github.com/Particular/ServicePulse/issues/new" target="_blank">
                <i class="fa fa-comment"></i>
                <span class="navbar-label">Feedback</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>  
</template>

<style>
</style>
