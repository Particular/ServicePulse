import { render, screen } from "@testing-library/vue";
import { describe, test, expect, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import type { Component } from "vue";
import { MessageStatus } from "@/resources/Message";
import RetryMessageButton from "@/components/messages/RetryMessageButton.vue";
import EditAndRetryButton from "@/components/messages/EditAndRetryButton.vue";
import DeleteMessageButton from "@/components/messages/DeleteMessageButton.vue";
import RestoreMessageButton from "@/components/messages/RestoreMessageButton.vue";

// Each failed-message action button is gated on its own ServiceControl permission. These
// tests pin the per-action gating: with auth enabled + the descriptor loaded, the button
// shows only when the matching permission is granted.
interface ButtonCase {
  name: string;
  component: Component;
  permission: string;
  text: RegExp;
  archived: boolean; // Restore is only relevant on an archived message; the others on a live one
}

// Retry / Delete / Restore are hidden when the permission is denied. Edit & retry is handled
// separately below: it is enabled by a setting and, when on, disabled (not hidden) without
// the permission.
const cases: ButtonCase[] = [
  { name: "Retry", component: RetryMessageButton, permission: "error:messages:retry", text: /Retry message/i, archived: false },
  { name: "Delete", component: DeleteMessageButton, permission: "error:messages:archive", text: /Delete message/i, archived: false },
  { name: "Restore", component: RestoreMessageButton, permission: "error:messages:unarchive", text: /Restore/i, archived: true },
];

function renderButton(component: Component, permissions: string[], archived: boolean) {
  render(component, {
    global: {
      plugins: [
        createTestingPinia({
          stubActions: true,
          initialState: {
            auth: { authEnabled: true, isAuthenticated: true },
            PermissionsStore: { permissions: new Set(permissions), loaded: true, loadAttempted: true },
            MessageStore: {
              state: { data: { id: "msg-1", status: MessageStatus.Failed, failure_status: { archived } } },
              edit_and_retry_config: { enabled: true, locked_headers: [], sensitive_headers: [] },
            },
          },
        }),
      ],
      directives: { tippy: () => {} },
    },
  });
}

describe("failed-message action button permissions", () => {
  beforeEach(() => {
    // Teleport target used by the confirm dialogs the buttons render.
    document.body.innerHTML = '<div id="modalDisplay"></div>';
  });

  test.each(cases)("$name is shown when its permission is granted", ({ component, permission, text, archived }) => {
    renderButton(component, [permission], archived);
    expect(screen.queryByText(text)).not.toBeNull();
  });

  test.each(cases)("$name is hidden when its permission is denied", ({ component, text, archived }) => {
    renderButton(component, [], archived);
    expect(screen.queryByText(text)).toBeNull();
  });

  test("Edit & retry is shown and enabled when error:messages:edit is granted", () => {
    renderButton(EditAndRetryButton, ["error:messages:edit"], false);
    const button = screen.getByRole("button", { name: /Edit & retry/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  test("Edit & retry is shown but disabled when error:messages:edit is denied", () => {
    renderButton(EditAndRetryButton, [], false);
    const button = screen.getByRole("button", { name: /Edit & retry/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
