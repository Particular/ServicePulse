import { useAuthStore } from "@/stores/AuthStore";

const UNAUTHENTICATED_ENDPOINTS = ["/api/authentication/configuration"];

function isUnauthenticatedEndpoint(url: string): boolean {
  return UNAUTHENTICATED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/**
 * Authenticated fetch wrapper that automatically includes JWT token
 * in the Authorization header when authentication is enabled.
 */
export function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const authStore = useAuthStore();
  const url = typeof input === "string" ? input : input.url;

  // Allow unauthenticated requests to specific endpoints
  if (isUnauthenticatedEndpoint(url)) {
    return fetch(input, init);
  }

  // If authentication is disabled, make request without token
  if (!authStore.authEnabled) {
    return fetch(input, init);
  }

  // If authentication is enabled, require a token
  // potentially handle token refresh here if expired, however it shouldnt be required due to silent renew
  const token = authStore.token;
  if (!token) {
    throw new Error("No authentication token available. Please authenticate first.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
