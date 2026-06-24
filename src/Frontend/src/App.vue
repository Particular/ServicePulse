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
import { useAuth } from "@/composables/useAuth";

const authStore = useAuthStore();
const route = useRoute();
const { isAuthenticated, authEnabled, isAuthenticating, authConfig } = storeToRefs(authStore);
const { authenticate } = useAuth();

// Check if the current route allows anonymous access (e.g., logged-out page)
const isAnonymousRoute = computed(() => route.meta?.allowAnonymous === true);
const shouldShowApp = computed(() => !authEnabled.value || isAuthenticated.value || isAnonymousRoute.value);
// Show full app layout (header, footer, notifications) only when authenticated or auth is disabled
const shouldShowFullLayout = computed(() => !authEnabled.value || isAuthenticated.value);

// If the session is lost while the app is running (e.g. the access token expired and silent
// renewal failed), re-trigger authentication instead of rendering a blank page. With a live
// identity-provider session this is a silent redirect round-trip; otherwise the user lands on
// the provider's login page. Without this the app renders nothing until a manual refresh.
watch([authEnabled, isAuthenticated, isAnonymousRoute], ([enabled, authenticated, anonymous]) => {
  if (enabled && !authenticated && !anonymous && !isAuthenticating.value && authConfig.value) {
    authenticate(authConfig.value);
  }
});
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
