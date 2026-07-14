import { render, screen } from "@testing-library/vue";
import { describe, test, expect, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import type { Component } from "vue";
import { MessageStatus } from "@/resources/Message";
import RetryMessageButton from "@/components/messages/RetryMessageButton.vue";
import EditAndRetryButton from "@/components/messages/EditAndRetryButton.vue";
import DeleteMessageButton from "@/components/messages/DeleteMessageButton.vue";
import RestoreMessageButton from "@/components/messages/RestoreMessageButton.vue";
import type { ManifestEntry } from "@/stores/AllowedRoutesStore";

// Each failed-message action button is gated on its own ServiceControl route. These
// tests pin the per-action gating: with auth enabled + the manifest loaded, the button
// shows only when the matching route is in the allowed set.
interface ButtonCase {
  name: string;
  component: Component;
  routeKey: string; // normalized route key in AllowedRoutesStore
  text: RegExp;
  archived: boolean; // Restore is only relevant on an archived message; the others on a live one
}

// Retry / Delete / Restore are hidden when the route is not allowed. Edit & retry is handled
// separately below: it is enabled by a setting and, when on, disabled (not hidden) without
// the permission.
const cases: ButtonCase[] = [
  { name: "Retry", component: RetryMessageButton, routeKey: "POST /api/errors/retry", text: /Retry message/i, archived: false },
  { name: "Delete", component: DeleteMessageButton, routeKey: "PATCH /api/errors/archive", text: /Delete message/i, archived: false },
  { name: "Restore", component: RestoreMessageButton, routeKey: "PATCH /api/errors/unarchive", text: /Restore/i, archived: true },
];

function makeRoutes(keys: string[]): Map<string, ManifestEntry> {
  return new Map(keys.map((k) => [k, { method: "", url_template: "" }]));
}

function renderButton(component: Component, allowedRouteKeys: string[], archived: boolean) {
  render(component, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: true,
          initialState: {
            auth: { authEnabled: true, isAuthenticated: true },
            AllowedRoutesStore: { routes: makeRoutes(allowedRouteKeys), loaded: true, loadAttempted: true },
            MessageStore: {
              state: { data: { id: "msg-1", status: MessageStatus.Failed, failure_status: { archived } } },
              edit_and_retry_config: { enabled: true, locked_headers: [], sensitive_headers: [] },
            },
          },
        }),
      ],
    },
  });
}

describe("failed-message action button permissions", () => {
  beforeEach(() => {
    // Teleport target used by the confirm dialogs the buttons render.
    document.body.innerHTML = '<div id="modalDisplay"></div>';
  });

  test.each(cases)("$name is shown when its route is allowed", ({ component, routeKey, text, archived }) => {
    renderButton(component, [routeKey], archived);
    expect(screen.queryByText(text)).not.toBeNull();
  });

  test.each(cases)("$name is hidden when its route is not allowed", ({ component, text, archived }) => {
    renderButton(component, [], archived);
    expect(screen.queryByText(text)).toBeNull();
  });

  test("Edit & retry is shown and enabled when edit route is allowed", () => {
    renderButton(EditAndRetryButton, ["POST /api/edit/{}"], false);
    const button = screen.getByRole("button", { name: /Edit & retry/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test("Edit & retry is shown but disabled when edit route is not allowed", () => {
    renderButton(EditAndRetryButton, [], false);
    const button = screen.getByRole("button", { name: /Edit & retry/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
