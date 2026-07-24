import type { AuthError } from "@/types/auth";

export interface AuthErrorDisplay {
  title: string;
  message: string;
}

/**
 * Maps a captured authentication failure to user-facing copy. Recognised OAuth error codes get
 * specific, actionable guidance; everything else — including local/callback exceptions with no
 * code — gets a generic message. The raw `error.description` is rendered separately by the
 * component, so it is not repeated here.
 */
export function describeAuthError(error: AuthError): AuthErrorDisplay {
  switch (error.code) {
    case "invalid_scope":
      return {
        title: "Unable to sign in",
        message: "Your identity provider rejected one or more of the requested scopes. The 'offline_access' scope may be disabled in your IdP, ask your administrator to enable it or update ServiceControl so ServicePulse does not request it.",
      };
    default:
      return {
        title: "Unable to sign in",
        message: "Something went wrong while signing you in. Contact your administrator if the problem continues.",
      };
  }
}
