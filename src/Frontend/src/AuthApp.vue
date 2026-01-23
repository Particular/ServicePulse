<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/AuthStore";
import routeLinks from "@/router/routeLinks";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import App from "./App.vue";

const { authenticate } = useAuth();
const authStore = useAuthStore();
const { isAuthenticating, loading } = storeToRefs(authStore);

onMounted(async () => {
  try {
    // Attempt to retrieve the authentication config from ServiceControl API
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

    // If the user is on an anonymous route (like logged-out), don't trigger authentication
    if (window.location.hash === `#${routeLinks.loggedOut}`) {
      console.debug("User is on logged-out page, skipping authentication");
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
  <div v-if="loading" class="loading-overlay">
    <LoadingSpinner />
    <div class="loading-text">Checking Authentication Details...</div>
  </div>
  <div v-else-if="isAuthenticating" class="loading-overlay">
    <LoadingSpinner />
    <div class="loading-text">Authenticating...</div>
  </div>
  <App v-else />
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #333;
}
</style>
