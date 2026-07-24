import type { UserManagerSettings } from "oidc-client-ts";

/**
 * Extended OIDC configuration using 'oidc-client-ts' package
 * This provides type-safe configuration for any OIDC-compliant identity provider
 */
export type AuthConfig = UserManagerSettings;

/**
 * A captured authentication failure.
 * `code` is the OAuth error code from an identity-provider error redirect (e.g. "invalid_scope");
 * it is absent for local/callback exceptions that carry no OAuth code.
 * `description` is the human-readable detail (the IdP's error_description or an exception message)
 * and is always shown to the user.
 */
export interface AuthError {
  code?: string;
  description: string;
}
