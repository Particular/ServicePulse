import { useAuthStore } from "@/stores/AuthStore";
import { useShowToast } from "@/composables/toast";
import { TYPE } from "vue-toastification";

const UNAUTHENTICATED_ENDPOINTS = ["/api/authentication/configuration"];

function isUnauthenticatedEndpoint(url: string): boolean {
  return UNAUTHENTICATED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

async function handle403Toast(response: Response): Promise<void> {
  let message = "You do not have permission to perform this action.";
  try {
    const body = await response.clone().json();
    if (body?.message) message = body.message;
  } catch {
    // keep default message
  }
  useShowToast(TYPE.ERROR, "Forbidden", message);
}

/**
 * Authenticated fetch wrapper that automatically includes JWT token
 * in the Authorization header when authentication is enabled.
 * When a 403 response is received the denial reason from ServiceControl's
 * structured body ({ error, message }) is surfaced as an error toast.
 */
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
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

  const response = await fetch(input, { ...init, headers });

  if (response.status === 403) {
    await handle403Toast(response);
  }

  return response;
}
