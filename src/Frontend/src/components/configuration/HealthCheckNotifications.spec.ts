import { render, describe, test, screen, expect, userEvent } from "@component-test-utils";
import { vi, beforeEach, afterEach } from "vitest";
import sut from "@/components/configuration/HealthCheckNotifications.vue";
import { createTestingPinia } from "@pinia/testing";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";
import type EmailSettings from "@/components/configuration/EmailSettings";

// ─── DSL ─────────────────────────────────────────────────────────────────────

interface ComponentDSL {
  actions: {
    clickEmailToggle(): Promise<void>;
    clickConfigureButton(): Promise<void>;
    clickSaveButton(): Promise<void>;
    clickCancelButton(): Promise<void>;
    clickSendTestNotification(): Promise<void>;
    fillValidEmailConfiguration(): Promise<void>;
  };
  assert: {
    emailToggleIsOn(): void;
    emailToggleIsOff(): void;
    emailConfigDialogIsVisible(): void;
    emailConfigDialogIsNotVisible(): void;
    saveButtonIsEnabled(): void;
    saveButtonIsDisabled(): void;
    testEmailSentSuccessfullyIsDisplayed(): Promise<void>;
    testFailedIsDisplayed(): Promise<void>;
    toggleEmailNotificationsActionWasCalled(): void;
    testEmailNotificationsActionWasCalled(): void;
    saveEmailNotificationsActionWasCalled(): void;
    saveEmailNotificationsActionWasNotCalled(): void;
    emailConfigFormReflects(config: Partial<EmailSettings>): void;
  };
}

// ─── Test suite ──────────────────────────────────────────────────────────────

// The email configuration modal is rendered via <Teleport to="#modalDisplay">.
// We ensure the target element exists before each test and is removed afterwards
// so the DOM is clean between runs.
beforeEach(() => {
  const existing = document.getElementById("modalDisplay");
  if (existing) document.body.removeChild(existing);
  const modalDisplay = document.createElement("div");
  modalDisplay.id = "modalDisplay";
  document.body.appendChild(modalDisplay);
});

afterEach(() => {
  const modalDisplay = document.getElementById("modalDisplay");
  if (modalDisplay) document.body.removeChild(modalDisplay);
});

describe("FEATURE: Health check notifications", () => {
  describe("RULE: Email notifications can be enabled and disabled", () => {
    test("EXAMPLE: Email notifications are currently disabled", async () => {
      /*
       * Given Email notifications are OFF
       * When the toggle button is clicked
       * Then the toggle email notifications action is invoked
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emailSettingsWithEnabled(false),
          },
        },
      });

      componentDriver.assert.emailToggleIsOff();

      await componentDriver.actions.clickEmailToggle();

      componentDriver.assert.toggleEmailNotificationsActionWasCalled();
    });

    test("EXAMPLE: Email notifications are currently enabled", async () => {
      /*
       * Given Email notifications are ON
       * When the toggle button is clicked
       * Then the toggle email notifications action is invoked
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emailSettingsWithEnabled(true),
          },
        },
      });

      componentDriver.assert.emailToggleIsOn();

      await componentDriver.actions.clickEmailToggle();

      componentDriver.assert.toggleEmailNotificationsActionWasCalled();
    });
  });

  describe("RULE: The email configuration dialog can be opened and closed", () => {
    test("EXAMPLE: The configuration dialog is not currently visible", async () => {
      /*
       * Given the Email configuration popup is not visible
       * When the "Configure" button is clicked
       * Then the Email configuration popup is displayed
       */
      const componentDriver = renderComponent();

      componentDriver.assert.emailConfigDialogIsNotVisible();

      await componentDriver.actions.clickConfigureButton();

      componentDriver.assert.emailConfigDialogIsVisible();
    });

    test("EXAMPLE: Edits have been made in the configuration dialog", async () => {
      /*
       * Given the Email configuration popup is visible
       * And edits have been made to the email configuration
       * When the Cancel button is pressed
       * Then the Email configuration popup is closed
       * And no changes have been made to the email configuration
       */
      const componentDriver = renderComponent();

      await componentDriver.actions.clickConfigureButton();
      componentDriver.assert.emailConfigDialogIsVisible();

      await componentDriver.actions.fillValidEmailConfiguration();

      await componentDriver.actions.clickCancelButton();

      componentDriver.assert.emailConfigDialogIsNotVisible();
      componentDriver.assert.saveEmailNotificationsActionWasNotCalled();
    });
  });

  describe("RULE: Email configuration can only be saved when the form is valid", () => {
    test("EXAMPLE: Required fields are missing or contain invalid values", async () => {
      /*
       * Given the Email configuration popup is visible
       * When invalid or incomplete data is entered into the form
       * Then the Save button is not enabled
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            // All fields empty – form is invalid by default
            emailNotifications: emptyEmailSettings(),
          },
        },
      });

      await componentDriver.actions.clickConfigureButton();

      // With all required fields empty the form is invalid; Save must be disabled
      componentDriver.assert.saveButtonIsDisabled();
    });

    test("EXAMPLE: All required fields are present and valid", async () => {
      /*
       * Given the Email configuration popup is visible
       * When valid data is entered for all required fields
       * Then the Save button is enabled
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emptyEmailSettings(),
          },
        },
      });

      await componentDriver.actions.clickConfigureButton();
      componentDriver.assert.saveButtonIsDisabled();

      await componentDriver.actions.fillValidEmailConfiguration();

      componentDriver.assert.saveButtonIsEnabled();
    });
  });

  describe("RULE: Saving email configuration updates the stored settings and closes the dialog", () => {
    test("EXAMPLE: A valid configuration has been entered", async () => {
      /*
       * Given the Email configuration popup is visible
       * And a valid configuration has been entered
       * When the Save button is clicked
       * Then the email configuration is updated
       * And the Email configuration popup is closed
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emptyEmailSettings(),
          },
        },
      });

      await componentDriver.actions.clickConfigureButton();
      await componentDriver.actions.fillValidEmailConfiguration();
      componentDriver.assert.saveButtonIsEnabled();

      await componentDriver.actions.clickSaveButton();

      componentDriver.assert.saveEmailNotificationsActionWasCalled();
      componentDriver.assert.emailConfigDialogIsNotVisible();
    });
  });

  describe("RULE: Health check notification settings persist after a page refresh", () => {
    test("EXAMPLE: Email configuration has been updated", async () => {
      /*
       * When the email configuration has been changed
       * And the screen is refreshed
       * Then the email notification configuration matches what was last saved
       *
       * The store's refresh() action is stubbed, so the initial state we set
       * represents what the store holds after loading previously-saved settings.
       */
      const savedConfig: EmailSettings = {
        enabled: true,
        enable_tls: true,
        smtp_server: "mail.example.com",
        smtp_port: 465,
        authentication_account: "user@example.com",
        authentication_password: "secret",
        from: "noreply@example.com",
        to: "admin@example.com",
      };

      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: savedConfig,
          },
        },
      });

      await componentDriver.actions.clickConfigureButton();
      componentDriver.assert.emailConfigFormReflects(savedConfig);
    });

    test("EXAMPLE: Email notifications were enabled before refresh", () => {
      /*
       * Given Email notifications are ON
       * When the page is refreshed
       * Then the Email notifications are ON
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emailSettingsWithEnabled(true),
          },
        },
      });

      componentDriver.assert.emailToggleIsOn();
    });

    test("EXAMPLE: Email notifications were disabled before refresh", () => {
      /*
       * Given Email notifications are OFF
       * When the page is refreshed
       * Then the Email notifications are OFF
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotifications: emailSettingsWithEnabled(false),
          },
        },
      });

      componentDriver.assert.emailToggleIsOff();
    });
  });

  describe("RULE: Sending a test notification indicates whether delivery succeeded or failed", () => {
    test("EXAMPLE: The email configuration is invalid", async () => {
      /*
       * Given an invalid configuration
       * When "Send test notification" is clicked
       * Then "TEST FAILED" is displayed
       */
      const componentDriver = renderComponent();
      const store = useHealthChecksStore();

      // Stub the action so it returns false (test notification failed)
      vi.mocked(store.testEmailNotifications).mockResolvedValue(false);

      await componentDriver.actions.clickSendTestNotification();

      componentDriver.assert.testEmailNotificationsActionWasCalled();
      await componentDriver.assert.testFailedIsDisplayed();
    });

    test("EXAMPLE: The email configuration is valid", async () => {
      /*
       * Given a valid configuration
       * When "Send test notification" is clicked
       * Then "Test email sent successfully" is displayed
       */
      const componentDriver = renderComponent();
      const store = useHealthChecksStore();

      // Stub the action so it returns true (test notification succeeded)
      vi.mocked(store.testEmailNotifications).mockResolvedValue(true);

      await componentDriver.actions.clickSendTestNotification();

      componentDriver.assert.testEmailNotificationsActionWasCalled();
      await componentDriver.assert.testEmailSentSuccessfullyIsDisplayed();
    });
  });
});

// ─── Render helper ───────────────────────────────────────────────────────────

function renderComponent({ initialState = {} }: { initialState?: Record<string, unknown> } = {}): ComponentDSL {
  const user = userEvent.setup();

  render(sut, {
    global: {
      plugins: [
        createTestingPinia({
          initialState,
          // With globals: true vitest automatically picks up the spy factory.
          // Explicitly providing it here keeps the setup self-documenting.
          createSpy: vi.fn,
          stubActions: true,
        }),
      ],
      directives: {
        // v-tippy is used by ActionButton; stub it in unit tests
        tippy: () => {},
      },
      stubs: {
        // RouterLink is used deep inside ServiceControlAvailable; stub it to
        // avoid "Failed to resolve component" warnings in unit tests
        RouterLink: true,
      },
    },
  });

  // After rendering, obtain the store so we can set up mock return values
  // and verify calls within assertions.
  const store = useHealthChecksStore();

  return {
    actions: {
      async clickEmailToggle() {
        // OnOffSwitch renders a styled <label role="switch"> as the interactive element.
        // Clicking the label fires a synthetic click on its associated hidden checkbox,
        // which in turn calls store.toggleEmailNotifications via the component handler.
        await user.click(screen.getByRole("switch", { name: /emailNotifications/i }));
      },

      async clickConfigureButton() {
        await user.click(screen.getByRole("button", { name: /configure/i }));
      },

      async clickSaveButton() {
        await user.click(screen.getByRole("button", { name: /save/i }));
      },

      async clickCancelButton() {
        await user.click(screen.getByRole("button", { name: /cancel/i }));
      },

      async clickSendTestNotification() {
        await user.click(screen.getByRole("button", { name: /send test notification/i }));
      },

      async fillValidEmailConfiguration() {
        await user.type(screen.getByLabelText(/smtp server address/i), "smtp.example.com");
        await user.type(screen.getByLabelText(/smtp server port/i), "587");
        await user.type(screen.getByLabelText(/from address/i), "from@example.com");
        // "To address" label contains extra text after a <br>; the regex matches the beginning
        await user.type(screen.getByLabelText(/to address/i), "to@example.com");
      },
    },

    assert: {
      emailToggleIsOn() {
        expect(screen.getByRole("switch", { name: /emailNotifications/i })).toHaveAttribute("aria-checked", "true");
      },

      emailToggleIsOff() {
        expect(screen.getByRole("switch", { name: /emailNotifications/i })).toHaveAttribute("aria-checked", "false");
      },

      emailConfigDialogIsVisible() {
        // The modal has role="dialog" and aria-labelledby pointing to "Email configuration"
        expect(screen.getByRole("dialog", { name: /email configuration/i })).toBeInTheDocument();
      },

      emailConfigDialogIsNotVisible() {
        expect(screen.queryByRole("dialog", { name: /email configuration/i })).not.toBeInTheDocument();
      },

      saveButtonIsEnabled() {
        expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
      },

      saveButtonIsDisabled() {
        expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
      },

      async testEmailSentSuccessfullyIsDisplayed() {
        // The result appears asynchronously; findByText polls until the element is in the DOM
        expect(await screen.findByText(/test email sent successfully/i)).toBeInTheDocument();
      },

      async testFailedIsDisplayed() {
        expect(await screen.findByText(/test failed/i)).toBeInTheDocument();
      },

      toggleEmailNotificationsActionWasCalled() {
        expect(store.toggleEmailNotifications).toHaveBeenCalled();
      },

      testEmailNotificationsActionWasCalled() {
        expect(store.testEmailNotifications).toHaveBeenCalled();
      },

      saveEmailNotificationsActionWasCalled() {
        expect(store.saveEmailNotifications).toHaveBeenCalled();
      },

      saveEmailNotificationsActionWasNotCalled() {
        expect(store.saveEmailNotifications).not.toHaveBeenCalled();
      },

      emailConfigFormReflects(config: Partial<EmailSettings>) {
        if (config.smtp_server !== undefined) {
          expect(screen.getByLabelText(/smtp server address/i)).toHaveValue(config.smtp_server);
        }
        if (config.smtp_port !== undefined) {
          expect(screen.getByLabelText(/smtp server port/i)).toHaveValue(config.smtp_port);
        }
        if (config.from !== undefined) {
          expect(screen.getByLabelText(/from address/i)).toHaveValue(config.from);
        }
        if (config.to !== undefined) {
          expect(screen.getByLabelText(/to address/i)).toHaveValue(config.to);
        }
        if (config.enable_tls !== undefined) {
          const checkbox = screen.getByLabelText(/use tls/i);
          if (config.enable_tls) {
            expect(checkbox).toBeChecked();
          } else {
            expect(checkbox).not.toBeChecked();
          }
        }
      },
    },
  };
}

// ─── Precondition helpers ────────────────────────────────────────────────────

function emptyEmailSettings(): EmailSettings {
  return {
    enabled: null,
    enable_tls: null,
    smtp_server: "",
    smtp_port: null,
    authentication_account: "",
    authentication_password: "",
    from: "",
    to: "",
  };
}

function emailSettingsWithEnabled(enabled: boolean): EmailSettings {
  return {
    ...emptyEmailSettings(),
    enabled,
  };
}
