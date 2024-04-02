<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { licenseStatus } from "../composables/serviceLicense";
import { connectionState, stats } from "../composables/serviceServiceControl";
import LicenseExpired from "../components/LicenseExpired.vue";
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
</script>

<template>
  <LicenseExpired />
  <template v-if="!licenseStatus.isExpired">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h1>Endpoint Heartbeats</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <div class="tabs">
            <!--Inactive Endpoints-->
            <h5 :class="{ active: isRouteSelected(routeLinks.heartbeats.inactive.link), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <RouterLink :to="routeLinks.heartbeats.inactive.link"> Inactive Endpoints ({{ stats.number_of_failed_heartbeats }}) </RouterLink>
            </h5>

            <!--Active Endpoints-->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: isRouteSelected(routeLinks.heartbeats.active.link), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <RouterLink :to="routeLinks.heartbeats.active.link"> Active Endpoints ({{ stats.number_of_failed_heartbeats }}) </RouterLink>
            </h5>

            <!--Configuration-->
            <h5 v-if="!licenseStatus.isExpired" :class="{ active: isRouteSelected(routeLinks.heartbeats.configuration.link), disabled: !connectionState.connected && !connectionState.connectedRecently }">
              <RouterLink :to="routeLinks.heartbeats.configuration.link"> Configuration </RouterLink>
            </h5>
          </div>
        </div>
      </div>
      <RouterView />
    </div>
  </template>
</template>

<style></style>
