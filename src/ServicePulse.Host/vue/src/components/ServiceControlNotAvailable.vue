<script setup lang="ts">
import { connectionState } from "./../composables/serviceServiceControl";
import { serviceControlUrl } from "./../composables/serviceServiceControlUrls";
import routeLinks from "@/router/routeLinks";
</script>

<template>
  <div class="sp-loader" v-if="connectionState.connecting"></div>
  <template v-if="connectionState.unableToConnect && !connectionState.connecting">
    <div class="text-center monitoring-no-data">
      <h1>Cannot connect to ServiceControl</h1>
      <p>
        ServicePulse is unable to connect to the ServiceControl instance at
        <span id="serviceControlUrl">{{ serviceControlUrl }}</span
        >. Please ensure that ServiceControl is running and accessible from your machine.
      </p>
      <div class="action-toolbar">
        <RouterLink :to="routeLinks.configuration.connections.link"><span class="btn btn-default btn-primary whiteText">View Connection Details</span></RouterLink>
        <a class="btn btn-default btn-secondary" href="https://docs.particular.net/monitoring/metrics/">Learn more</a>
      </div>
    </div>
  </template>
</template>
