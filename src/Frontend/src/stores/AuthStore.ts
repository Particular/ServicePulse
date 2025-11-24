import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const isAuthenticating = ref(false);
  const authError = ref<string | null>(null);

  function setToken(newToken: string | null) {
    token.value = newToken;
    isAuthenticated.value = !!newToken;

    if (newToken) {
      // Store token in sessionStorage for persistence across page reloads
      sessionStorage.setItem("auth_token", newToken);
    } else {
      sessionStorage.removeItem("auth_token");
    }
  }

  function clearToken() {
    setToken(null);
    authError.value = null;
  }

  function loadTokenFromStorage() {
    const storedToken = sessionStorage.getItem("auth_token");
    if (storedToken) {
      token.value = storedToken;
      isAuthenticated.value = true;
    }
  }

  function setAuthenticating(value: boolean) {
    isAuthenticating.value = value;
  }

  function setAuthError(error: string | null) {
    authError.value = error;
  }

  return {
    token,
    isAuthenticated,
    isAuthenticating,
    authError,
    setToken,
    clearToken,
    loadTokenFromStorage,
    setAuthenticating,
    setAuthError,
  };
});
