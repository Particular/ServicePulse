<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import "bootstrap";
import LicenseNotifications from "@/components/LicenseNotifications.vue";
import BackendChecksNotifications from "@/components/BackendChecksNotifications.vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/AuthStore";

const authStore = useAuthStore();
const route = useRoute();
const { isAuthenticated, authEnabled } = storeToRefs(authStore);

// Check if the current route allows anonymous access (e.g., logged-out page)
const isAnonymousRoute = computed(() => route.meta?.allowAnonymous === true);
const shouldShowApp = computed(() => !authEnabled.value || isAuthenticated.value || isAnonymousRoute.value);
// Show full app layout (header, footer, notifications) only when authenticated or auth is disabled
const shouldShowFullLayout = computed(() => !authEnabled.value || isAuthenticated.value);
</script>

<template>
  <template v-if="shouldShowApp">
    <page-header v-if="shouldShowFullLayout" />
    <div v-if="shouldShowFullLayout" class="container-fluid" id="main-content">
      <RouterView />
    </div>
    <RouterView v-else />
    <LicenseNotifications v-if="shouldShowFullLayout" />
    <BackendChecksNotifications v-if="shouldShowFullLayout" />
    <page-footer v-if="shouldShowFullLayout" />
  </template>
</template>
