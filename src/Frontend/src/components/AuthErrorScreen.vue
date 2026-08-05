<script setup lang="ts">
import { computed } from "vue";
import type { AuthError } from "@/types/auth";
import { describeAuthError } from "@/composables/authError";

const props = defineProps<{
  error: AuthError;
}>();

const display = computed(() => describeAuthError(props.error));
</script>

<template>
  <div class="auth-error-container">
    <div class="auth-error-content">
      <h1 class="auth-error-title">{{ display.title }}</h1>
      <p class="auth-error-message">{{ display.message }}</p>
      <p class="auth-error-detail" role="status">Details: {{ props.error.description }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Modeled on LoggedOutView.vue for a consistent full-screen auth surface. */
.auth-error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.auth-error-content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.auth-error-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.auth-error-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.auth-error-detail {
  font-size: 13px;
  color: #999;
  word-break: break-word;
}
</style>
