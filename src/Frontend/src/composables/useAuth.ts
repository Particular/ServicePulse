import { useAuthStore } from "@/stores/AuthStore";
import type { AuthConfig } from "@/types/auth";
import { UserManager, type User } from "oidc-client-ts";

let userManager: UserManager | null = null;

/**
 * Authentication composable using 'oidc-client-ts' package
 * Supports any OIDC-compliant identity provider (Entra ID, Auth0, Okta, etc.)
 */
export function useAuth() {
  const authStore = useAuthStore();

  function initializeUserManager(config: AuthConfig): UserManager {
    if (!userManager) {
      userManager = new UserManager(config);

      // Set up event handlers
      userManager.events.addUserLoaded((user: User) => {
        console.debug("User loaded:", user.profile);
        authStore.setToken(user.access_token);
      });

      userManager.events.addUserUnloaded(() => {
        console.debug("User unloaded");
        authStore.clearToken();
      });

      userManager.events.addAccessTokenExpiring(async () => {
        console.debug("Access token expiring, attempting silent renewal...");
        try {
          await userManager?.signinSilent();
        } catch (error) {
          console.error("Silent token renewal failed:", error);
        }
      });

      userManager.events.addAccessTokenExpired(() => {
        console.debug("Access token expired");
        authStore.clearToken();
      });

      userManager.events.addSilentRenewError((error) => {
        console.error("Silent renew error:", error);
      });
    }

    return userManager;
  }

  /**
   * Gets the current user from the UserManager
   */
  async function getUser(): Promise<User | null> {
    if (!userManager) {
      return null;
    }
    return await userManager.getUser();
  }

  /**
   * Attempts to authenticate the user
   * This checks for existing authentication or handles the callback from the identity provider
   */
  async function authenticate(config: AuthConfig): Promise<boolean> {
    const manager = initializeUserManager(config);

    try {
      // Check if we're returning from the identity provider (callback)
      // Look for specific OAuth parameters in the URL
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.has("code");
      const hasState = params.has("state");
      const hasError = params.has("error");

      if (hasCode && hasState) {
        // This is an OAuth callback with authorization code
        console.debug("Processing OAuth callback...");
        authStore.setAuthenticating(true);
        try {
          const user = await manager.signinCallback();
          console.debug("Signin callback successful");
          if (user) {
            authStore.setToken(user.access_token);
            // Clean up URL by removing OAuth parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
          }
        } catch (error) {
          console.error("Signin callback error details:", {
            error,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            errorStack: error instanceof Error ? error.stack : undefined,
          });
          authStore.setAuthError(error instanceof Error ? error.message : "Callback failed");
          // Don't continue - callback failed, user needs to try again
          return false;
        } finally {
          authStore.setAuthenticating(false);
        }
      } else if (hasError) {
        // OAuth error in callback
        const errorDescription = params.get("error_description") || params.get("error");
        console.error("OAuth error:", errorDescription);
        authStore.setAuthError(errorDescription || "Authentication failed");
        return false;
      }

      // Check for existing valid user session
      const user = await manager.getUser();
      if (user && !user.expired) {
        console.debug("Existing user session found", user.profile);
        authStore.setToken(user.access_token);
        return true;
      }

      // No valid session, initiate login
      authStore.setAuthenticating(true);
      await manager.signinRedirect();
      return false; // Will redirect, so this won't actually return
    } catch (error) {
      authStore.setAuthenticating(false);
      const errorMessage = error instanceof Error ? error.message : "Unknown authentication error";
      authStore.setAuthError(errorMessage);
      console.error("Authentication error:", error);
      throw error;
    }
  }

  /**
   * Logs out the user and optionally redirects to the identity provider's logout endpoint
   */
  async function logout(redirectToIdp: boolean = true): Promise<void> {
    if (!userManager) {
      authStore.clearToken();
      return;
    }

    try {
      if (redirectToIdp) {
        // Sign out and redirect to the identity provider
        await userManager.signoutRedirect();
      } else {
        // Remove local session only
        await userManager.removeUser();
        authStore.clearToken();
      }
    } catch (error) {
      console.error("Logout error:", error);
      authStore.clearToken();
    }
  }

  return {
    authenticate,
    logout,
    getUser,
    isAuthenticated: authStore.isAuthenticated,
    isAuthenticating: authStore.isAuthenticating,
    authError: authStore.authError,
  };
}
