<script setup lang="ts">
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
</script>

<template>
  <div class="row mt-2">
    <div class="col-sm-12">
      <div class="nav tabs">
        <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.licensedEndpoints.link) }">
          <RouterLink :to="routeLinks.throughput.licenseDetails.licensedEndpoints.link">Licensed Endpoints</RouterLink>
        </h5>
        <h5 class="nav-item" role="tab" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.infrastructureQueues.link) }">
          <RouterLink :to="routeLinks.throughput.licenseDetails.infrastructureQueues.link">Infrastructure Queues</RouterLink>
        </h5>
        <h5 class="nav-item" :class="{ active: isRouteSelected(routeLinks.throughput.licenseDetails.excludedQueues.link) }">
          <RouterLink :to="routeLinks.throughput.licenseDetails.excludedQueues.link">Excluded Queues</RouterLink>
        </h5>
      </div>
    </div>
  </div>
  <div class="intro">
    <RouterView />
  </div>
</template>

<style scoped></style>
