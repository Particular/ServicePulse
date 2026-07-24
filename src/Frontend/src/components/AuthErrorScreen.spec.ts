import { expect, test, describe, render, screen } from "@component-test-utils";

import AuthErrorScreen from "./AuthErrorScreen.vue";

describe("AuthErrorScreen", () => {
  test("shows scope-specific guidance and the raw detail for invalid_scope", async () => {
    render(AuthErrorScreen, {
      props: {
        error: { code: "invalid_scope", description: "Invalid scopes: Pulse openid profile email offline_access" },
      },
    });

    expect(await screen.findByText("Unable to sign in")).toBeVisible();
    expect(screen.getByText(/'offline_access' scope may be disabled/)).toBeVisible();
    expect(screen.getByText(/Invalid scopes: Pulse openid profile email offline_access/)).toBeVisible();
  });

  test("shows a generic message and the raw detail for an error without a recognized code", async () => {
    render(AuthErrorScreen, {
      props: { error: { description: "Callback failed" } },
    });

    expect(await screen.findByText(/Contact your administrator/)).toBeVisible();
    expect(screen.getByText(/Callback failed/)).toBeVisible();
  });
});
