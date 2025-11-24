import type { AuthConfig } from "@/types/auth";
import { WebStorageStateStore } from "oidc-client-ts";

// Retrieve configuration values from environment variables
const authorityUrl = import.meta.env.VITE_ENTRA_AUTHORITY;
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID;
const serviceControlApiScope = import.meta.env.VITE_ENTRA_SERVICE_CONTROL_API_SCOPE;

export const authConfig: AuthConfig = {
  authority: authorityUrl,
  client_id: clientId,
  redirect_uri: window.location.origin,
  // todo: Consider a dedicated logout redirect page if needed
  post_logout_redirect_uri: window.location.origin,
  // Use authorization code flow with PKCE (recommended for SPAs)
  response_type: "code",
  // openid, profile, email are standard OIDC scopes
  // offline_access enables refresh tokens
  scope: `${serviceControlApiScope} openid profile email offline_access`,
  // Automatically attempt silent token renewal before expiration
  automaticSilentRenew: true,
  // Load user profile from the UserInfo endpoint
  // Enable this if you need additional user profile data from Graph
  loadUserInfo: false,
  includeIdTokenInSilentRenew: true,
  // Silent renew configuration
  silent_redirect_uri: window.location.origin + "/silent-renew.html",
  // Optional: Filter OIDC protocol claims from profile
  filterProtocolClaims: true,
  // Storage configuration - explicitly use sessionStorage
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
};
