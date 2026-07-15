<script setup lang="ts">
import { RouterLink } from "vue-router";
import routeLinks from "@/router/routeLinks";
import FAIcon from "@/components/FAIcon.vue";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { useLicenseDetailsStore } from "@/stores/LicenseDetailsStore";
import { storeToRefs } from "pinia";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { WarningLevel } from "@/components/WarningLevel";

const licenseDetailsStore = useLicenseDetailsStore();
const { endpoints } = storeToRefs(licenseDetailsStore);
</script>

<template>
  <RouterLink :to="routeLinks.throughput.root">
    <FAIcon :icon="faFileLines" title="Usage" />
    <span class="navbar-label">Usage</span>
    <ExclamationMark v-if="endpoints.some((endpoint) => endpoint.isInBreach)" :type="WarningLevel.Warning" />
  </RouterLink>
</template>

<style scoped>
@import "@/assets/navbar.css";
@import "@/assets/header-menu-item.css";
</style>
