import { describe, test, expect } from "vitest";
import { describeAuthError } from "@/composables/authError";

describe("describeAuthError", () => {
  test("gives scope-specific guidance for invalid_scope", () => {
    const result = describeAuthError({
      code: "invalid_scope",
      description: "Invalid scopes: Pulse openid profile email offline_access",
    });
    expect(result.title).toBe("Unable to sign in");
    expect(result.message).toContain("offline_access");
  });

  test("gives a generic message for an unrecognized code", () => {
    const result = describeAuthError({ code: "server_error", description: "server_error" });
    expect(result.message).toContain("Contact your administrator");
  });

  test("gives a generic message when there is no code", () => {
    const result = describeAuthError({ description: "Callback failed" });
    expect(result.message).toContain("Contact your administrator");
  });
});
