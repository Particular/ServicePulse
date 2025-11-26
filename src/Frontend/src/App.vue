<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterView } from "vue-router";
import PageFooter from "./components/PageFooter.vue";
import PageHeader from "./components/PageHeader.vue";
import "bootstrap";
import LicenseNotifications from "@/components/LicenseNotifications.vue";
import BackendChecksNotifications from "@/components/BackendChecksNotifications.vue";
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/AuthStore";

const { authenticate } = useAuth();
const authStore = useAuthStore();
const { isAuthenticating, isAuthenticated, authEnabled } = storeToRefs(authStore);
const shouldShowApp = computed(() => !authEnabled.value || isAuthenticated.value);

onMounted(async () => {
  try {
    // Attempt to authenticate when the app first loads
    await authStore.refresh();

    // If authentication is not enabled, skip authentication
    if (!authStore.authEnabled) {
      console.debug("Authentication is disabled");
      authStore.setAuthenticating(false);
      return;
    }

    // Check if auth config is available
    if (!authStore.authConfig) {
      console.debug("Authentication is enabled but configuration not available");
      authStore.setAuthenticating(false);
      return;
    }

    // The authenticate function will:
    // 1. Check if we're returning from the identity provider (handle callback)
    // 2. Check for an existing valid session
    // 3. If no valid session, redirect to the identity provider
    const authenticated = await authenticate(authStore.authConfig);

    if (authenticated) {
      console.debug("User authenticated successfully");
    } else {
      console.debug("Redirecting to identity provider for authentication...");
    }
  } catch (error) {
    console.error("Failed to authenticate on app load:", error);
    authStore.setAuthenticating(false);
  }
});
</script>

<template>
  <div v-if="isAuthenticating" class="auth-loading-overlay">
    <div class="auth-loading-spinner">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Authenticating...</span>
      </div>
      <p class="auth-loading-text">Authenticating...</p>
    </div>
  </div>
  <template v-if="shouldShowApp">
    <page-header />
    <div class="container-fluid" id="main-content">
      <RouterView />
    </div>
    <LicenseNotifications />
    <BackendChecksNotifications />
    <page-footer />
  </template>
</template>

<style scoped>
.auth-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.auth-loading-spinner {
  text-align: center;
}

.auth-loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #333;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
