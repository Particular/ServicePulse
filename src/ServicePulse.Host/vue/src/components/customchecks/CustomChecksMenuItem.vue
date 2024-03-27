<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
import routeLinks from "@/router/routeLinks";
import isRouteSelected from "@/composables/isRouteSelected";
import { storeToRefs } from "pinia";

const store = useCustomChecksStore();
const { failingCount } = storeToRefs(store);
</script>

<template>
  <RouterLink :class="{ active: isRouteSelected(routeLinks.customChecks) }" :to="routeLinks.customChecks">
    <i class="fa fa-check icon-white" title="Custom Checks"></i>
    <span class="navbar-label">Custom Checks</span>
    <span v-if="failingCount > 0" class="badge badge-important">{{ failingCount }}</span>
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";

.nav {
  --bs-link-color: #9d9d9d;
  --bs-link-hover-color: #fff;
}

.navbar > .container-fluid > div {
  margin: 0 1em;
}
</style>
