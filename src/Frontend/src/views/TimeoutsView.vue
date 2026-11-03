<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { storeToRefs } from "pinia";
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
import useTimeoutCountsStoreAutoRefresh from "@/composables/useTimeoutCountsStoreAutoRefresh";

const { store } = useTimeoutCountsStoreAutoRefresh();
const { pendingCount, overdueCount } = storeToRefs(store);
</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h1>Timeouts</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <div class="tabs" role="tablist" aria-label="timeout-tabs">
          <h5 :class="{ active: isRouteSelected(routeLinks.timeouts.pending.link) }">
            <RouterLink :to="routeLinks.timeouts.pending.link" role="tab">Pending ({{ pendingCount }})</RouterLink>
          </h5>
          <h5 :class="{ active: isRouteSelected(routeLinks.timeouts.overdue.link) }">
            <RouterLink :to="routeLinks.timeouts.overdue.link" role="tab">Overdue ({{ overdueCount }})</RouterLink>
          </h5>
          <h5 :class="{ active: isRouteSelected(routeLinks.timeouts.all.link) }">
            <RouterLink :to="routeLinks.timeouts.all.link" role="tab">All</RouterLink>
          </h5>
        </div>
      </div>
    </div>
    <RouterView />
  </div>
</template>
