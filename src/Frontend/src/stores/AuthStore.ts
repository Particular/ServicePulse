import { defineStore } from "pinia";
import { ref } from "vue";
import { useServiceControlStore } from "./ServiceControlStore";
import type { AuthConfig } from "@/types/auth";
import { WebStorageStateStore } from "oidc-client-ts";

interface AuthConfigResponse {
  enabled: boolean;
  client_id: string;
  authority: string;
  api_scope: string;
}

export const useAuthStore = defineStore("auth", () => {
  const serviceControlStore = useServiceControlStore();

  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const isAuthenticating = ref(false);
  const authError = ref<string | null>(null);
  const authConfig = ref<AuthConfig | null>(null);
  const loading = ref(false);

  async function refresh() {
    loading.value = true;
    try {
      const config = await getAuthConfig();
      if (config) {
        authConfig.value = transformToAuthConfig(config);
      }
    } finally {
      loading.value = false;
    }
  }

  async function getAuthConfig() {
    try {
      const [, data] = await serviceControlStore.fetchTypedFromServiceControl<AuthConfigResponse>("authentication/configuration");
      return data;
    } catch (err) {
      console.error("Error fetching auth config information", err);
      return null;
    }
  }

  function transformToAuthConfig(config: AuthConfigResponse): AuthConfig {
    return {
      authority: config.authority,
      client_id: config.client_id,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      response_type: "code",
      scope: `${config.api_scope} openid profile email offline_access`,
      automaticSilentRenew: true,
      loadUserInfo: false,
      includeIdTokenInSilentRenew: true,
      silent_redirect_uri: window.location.origin + "/silent-renew.html",
      filterProtocolClaims: true,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    };
  }

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
    authConfig,
    loading,
    refresh,
    setToken,
    clearToken,
    loadTokenFromStorage,
    setAuthenticating,
    setAuthError,
  };
});
