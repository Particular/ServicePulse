<script setup lang="ts">
import { useAuthStore } from "@/stores/AuthStore";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { authEnabled } = storeToRefs(authStore);

function handleSignIn() {
  // Redirect to the main app, which will trigger the auth flow
  window.location.href = window.location.origin + window.location.pathname;
}
</script>

<template>
  <div class="logged-out-container">
    <div class="logged-out-content" v-if="authEnabled">
      <h1 class="logged-out-title">You have been signed out</h1>
      <p class="logged-out-message">You have successfully signed out of ServicePulse.</p>
      <button type="button" class="btn btn-primary sign-in-button" @click="handleSignIn">Sign in again</button>
    </div>
    <div v-else>
      <h1 class="logged-out-title">Authentication is disabled</h1>
      <p class="logged-out-message">Authentication is currently disabled in ServicePulse</p>
    </div>
  </div>
</template>

<style scoped>
.logged-out-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.logged-out-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.logged-out-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.logged-out-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.sign-in-button {
  padding: 12px 32px;
  font-size: 16px;
}
</style>
