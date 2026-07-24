<script setup lang="ts">
import { computed, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import "bootstrap";
import LicenseNotifications from "@/components/LicenseNotifications.vue";
import BackendChecksNotifications from "@/components/BackendChecksNotifications.vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/AuthStore";
import { useAllowedRoutes } from "@/composables/useAllowedRoutes";
import { useConfigurationStore } from "@/stores/ConfigurationStore";

const authStore = useAuthStore();
const configurationStore = useConfigurationStore();
const route = useRoute();
const { isAuthenticated, authEnabled, loading } = storeToRefs(authStore);

// Load the allowed-route manifest (my/routes) once authenticated, so the nav and other
// UI can gate on it. Fail-safe: a missing/old endpoint just leaves the manifest unloaded
// and the UI fails open.
const { fetchManifest } = useAllowedRoutes();
watch(
  [authEnabled, isAuthenticated],
  ([enabled, authenticated]) => {
    if (enabled && authenticated) {
      fetchManifest();
    }
  },
  { immediate: true }
);

// Check if the current route allows anonymous access (e.g., logged-out page)
const isAnonymousRoute = computed(() => route.meta?.allowAnonymous === true);
const shouldShowApp = computed(() => !authEnabled.value || isAuthenticated.value || isAnonymousRoute.value);
// Show full app layout (header, footer, notifications) only when authenticated or auth is disabled
const shouldShowFullLayout = computed(() => !authEnabled.value || isAuthenticated.value);

watch(
  [loading, authEnabled, isAuthenticated],
  ([isLoading, enabled, authenticated]) => {
    if (!isLoading && (!enabled || authenticated)) {
      configurationStore.ensureLoaded();
    }
  },
  { immediate: true }
);
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
