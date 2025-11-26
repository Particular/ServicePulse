import { useAuthStore } from "@/stores/AuthStore";

/**
 * Authenticated fetch wrapper that automatically includes JWT token
 * in the Authorization header for all requests
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const authStore = useAuthStore();
  const token = authStore.token;

  // Allow unauthenticated requests to the auth configuration endpoint
  const url = typeof input === "string" ? input : input.url;
  if (url.includes("/api/authentication/configuration")) {
    return await fetch(input, init);
  }

  // todo: potentially handle token refresh here if expired, however it shouldnt be required due to silent renew
  if (!token) {
    throw new Error("No authentication token available. Please authenticate first.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return await fetch(input, { ...init, headers });
}
