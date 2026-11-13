<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import { storeToRefs } from "pinia";
import FAIcon from "@/components/FAIcon.vue";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import useCustomChecksStoreAutoRefresh from "@/composables/useCustomChecksStoreAutoRefresh";

const { store } = useCustomChecksStoreAutoRefresh();
const { failingCount } = storeToRefs(store);
</script>

<template>
  <RouterLink :to="routeLinks.customChecks">
    <FAIcon :icon="faCheck" />
    <span class="side-bar-label">Custom Checks</span>
    <span v-if="failingCount > 0" class="badge badge-important">{{ failingCount }}</span>
  </RouterLink>
</template>
