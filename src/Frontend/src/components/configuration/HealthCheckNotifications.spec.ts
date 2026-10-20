import { render, describe, test, screen, within, expect, userEvent, mockEndpoint, mockEndpointDynamic } from "@component-test-utils";
import { waitFor } from "@testing-library/vue";
import { vi, beforeEach, afterEach } from "vitest";
import sut from "@/components/configuration/HealthCheckNotifications.vue";
import { createTestingPinia } from "@pinia/testing";
import { useHealthChecksStore, type HealthChecksStore } from "@/stores/HealthChecksStore";
import type EmailNotifications from "@/resources/EmailNotifications";
import type UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";
import { mockServer } from "../../../test/mock-server";

// ─── DSL ─────────────────────────────────────────────────────────────────────

interface ComponentDSL {
  actions: {
    toggleEmailNotifications(): Promise<void>;
    openEmailConfiguration(): Promise<void>;
    confirmEmailConfigurationChanges(): Promise<void>;
    discardEmailConfigurationChanges(): Promise<void>;
    requestTestNotification(): Promise<void>;
    provideValidEmailConfiguration(): Promise<void>;
    enterPassword(password: string): Promise<void>;
    removeAccount(): Promise<void>;
    settingsChangeInServiceControl(changes: Partial<EmailNotifications>): void;
    serviceControlBecomesUnreachable(): void;
  };
  verify: {
    emailNotificationsAreEnabled(): void;
    emailNotificationsAreDisabled(): void;
    emailConfigurationIsAccessible(): void;
    emailConfigurationIsNotAccessible(): void;
    userCanSaveConfiguration(): void;
    userCannotSaveConfiguration(): void;
    testNotificationWasSuccessful(): Promise<void>;
    testNotificationFailed(): Promise<void>;
    emailNotificationsWereToggled(): void;
    testNotificationWasRequested(): void;
    emailConfigurationWasSaved(): void;
    emailConfigurationWasNotSaved(): void;
    savedSettingsInclude(settings: Partial<UpdateEmailNotificationsSettingsRequest>): void;
    emailConfigurationMatches(config: Partial<EmailNotifications>): void;
    storedPasswordIsNotShownAndCanBeKept(): void;
    limitingTheSmtpAccountIsRecommended(): void;
    emailSettingsCouldNotBeLoaded(): void;
  };
}

// The store state a test can start from. Only page-level state lives in the store; the dialog reads the settings it
// edits from ServiceControl, given with settingsInServiceControl.
interface InitialState {
  HealthChecksStore?: Partial<Pick<HealthChecksStore, "emailNotificationsEnabled">>;
}

const storedPassword = "stored-secret";

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
  mockServer.resetHandlers();
});

describe("FEATURE: Health check notifications", () => {
  describe("RULE: Must let email notifications be turned on and off", () => {
    test("EXAMPLE: The one where email notifications are off and get switched on", async () => {
      /*
       * Given Email notifications are OFF
       * When the toggle button is clicked
       * Then the toggle email notifications action is invoked
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotificationsEnabled: false,
          },
        },
      });

      componentDriver.verify.emailNotificationsAreDisabled();
      await componentDriver.actions.toggleEmailNotifications();
      componentDriver.verify.emailNotificationsWereToggled();
    });

    test("EXAMPLE: The one where email notifications are on and get switched off", async () => {
      /*
       * Given Email notifications are ON
       * When the toggle button is clicked
       * Then the toggle email notifications action is invoked
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotificationsEnabled: true,
          },
        },
      });

      componentDriver.verify.emailNotificationsAreEnabled();
      await componentDriver.actions.toggleEmailNotifications();
      componentDriver.verify.emailNotificationsWereToggled();
    });
  });

  describe("RULE: Must let the email configuration dialog be opened and closed without saving", () => {
    test("EXAMPLE: The one where Configure is clicked, and the dialog opens", async () => {
      /*
       * Given the Email configuration popup is not visible
       * When the "Configure" button is clicked
       * Then the Email configuration popup is displayed
       */
      const componentDriver = renderComponent();

      componentDriver.verify.emailConfigurationIsNotAccessible();
      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.emailConfigurationIsAccessible();
    });

    test("EXAMPLE: The one where edits are made and then cancelled, and nothing is saved", async () => {
      /*
       * Given the Email configuration popup is visible
       * And edits have been made to the email configuration
       * When the Cancel button is pressed
       * Then the Email configuration popup is closed
       * And no changes have been made to the email configuration
       */
      const componentDriver = renderComponent();

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.emailConfigurationIsAccessible();
      await componentDriver.actions.provideValidEmailConfiguration();
      await componentDriver.actions.discardEmailConfigurationChanges();
      componentDriver.verify.emailConfigurationIsNotAccessible();
      componentDriver.verify.emailConfigurationWasNotSaved();
    });
  });

  describe("RULE: Must allow saving the email configuration only when the form is valid", () => {
    test("EXAMPLE: The one where every required field is valid, and the configuration can be saved", async () => {
      /*
       * Given the Email configuration popup is visible
       * When valid data is entered for all required fields
       * Then the Save button is enabled
       */
      const componentDriver = renderComponent({ settingsInServiceControl: emptyEmailSettings() });

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.userCannotSaveConfiguration();
      await componentDriver.actions.provideValidEmailConfiguration();
      componentDriver.verify.userCanSaveConfiguration();
    });

    test("COUNTER-EXAMPLE: The one where required fields are missing or invalid, and the configuration cannot be saved", async () => {
      /*
       * Given the Email configuration popup is visible
       * When invalid or incomplete data is entered into the form
       * Then the Save button is not enabled
       */
      // All fields empty – form is invalid by default
      const componentDriver = renderComponent({ settingsInServiceControl: emptyEmailSettings() });

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.userCannotSaveConfiguration();
    });
  });

  describe("RULE: Must close the dialog once a valid email configuration is saved", () => {
    test("EXAMPLE: The one where a valid configuration is saved, and the dialog closes", async () => {
      /*
       * Given the Email configuration popup is visible
       * And a valid configuration has been entered
       * When the Save button is clicked
       * Then the email configuration is updated
       * And the Email configuration popup is closed
       */
      const componentDriver = renderComponent({ settingsInServiceControl: emptyEmailSettings() });

      await componentDriver.actions.openEmailConfiguration();
      await componentDriver.actions.provideValidEmailConfiguration();
      componentDriver.verify.userCanSaveConfiguration();
      await componentDriver.actions.confirmEmailConfigurationChanges();
      componentDriver.verify.emailConfigurationWasSaved();
      componentDriver.verify.emailConfigurationIsNotAccessible();
    });
  });

  describe("RULE: Must show the saved settings after a page refresh", () => {
    test("EXAMPLE: The one where the configuration was changed before the refresh, and the dialog shows what was last saved", async () => {
      /*
       * When the email configuration has been changed
       * And the screen is refreshed
       * Then the email notification configuration matches what was last saved
       *
       * ServiceControl's response is mocked, so the settings we provide represent
       * what ServiceControl returns for previously-saved settings.
       */
      const savedConfig: EmailNotifications = {
        enabled: true,
        enable_tls: true,
        smtp_server: "mail.example.com",
        smtp_port: 465,
        authentication_account: "user@example.com",
        from: "noreply@example.com",
        to: "admin@example.com",
      };

      const componentDriver = renderComponent({ settingsInServiceControl: savedConfig });

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.emailConfigurationMatches(savedConfig);
    });

    test("EXAMPLE: The one where email notifications were on before the refresh, and they are still shown as on", () => {
      /*
       * Given Email notifications are ON
       * When the page is refreshed
       * Then the Email notifications are ON
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotificationsEnabled: true,
          },
        },
      });

      componentDriver.verify.emailNotificationsAreEnabled();
    });

    test("EXAMPLE: The one where email notifications were off before the refresh, and they are still shown as off", () => {
      /*
       * Given Email notifications are OFF
       * When the page is refreshed
       * Then the Email notifications are OFF
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotificationsEnabled: false,
          },
        },
      });

      componentDriver.verify.emailNotificationsAreDisabled();
    });
  });

  describe("RULE: Must show the settings ServiceControl has now when the dialog opens", () => {
    test("EXAMPLE: The one where another user changed the settings after the page loaded, and the dialog shows their change", async () => {
      /*
       * Given the page was loaded with the To address old@example.com
       * And another user changed the To address in ServiceControl to new@example.com
       * When the Email configuration popup is opened
       * Then the To address is new@example.com
       */
      const componentDriver = renderComponent({ settingsInServiceControl: { ...emptyEmailSettings(), to: "old@example.com" } });

      componentDriver.actions.settingsChangeInServiceControl({ to: "new@example.com" });
      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.emailConfigurationMatches({ to: "new@example.com" });
    });

    test("COUNTER-EXAMPLE: The one where ServiceControl cannot be reached when the dialog opens, and it says the settings could not be loaded", async () => {
      /*
       * Given Email notifications are ON
       * And ServiceControl cannot be reached
       * When the Email configuration popup is opened
       * Then it says that the settings could not be loaded
       * And the configuration cannot be saved
       * And Email notifications are still shown as ON
       */
      const componentDriver = renderComponent({
        initialState: {
          HealthChecksStore: {
            emailNotificationsEnabled: true,
          },
        },
      });

      componentDriver.actions.serviceControlBecomesUnreachable();
      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.emailSettingsCouldNotBeLoaded();
      componentDriver.verify.userCannotSaveConfiguration();
      componentDriver.verify.emailNotificationsAreEnabled();
    });
  });

  describe("RULE: Must never show the stored SMTP password", () => {
    test("EXAMPLE: The one where ServiceControl returns the stored password, and the password field stays empty", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which returns the stored SMTP password
       * When the Email configuration popup is opened
       * Then the password field is empty
       * And the field explains that an empty password keeps the stored password
       */
      const componentDriver = renderComponent({ settingsInServiceControl: settingsWithStoredPassword() });

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.storedPasswordIsNotShownAndCanBeKept();
    });
  });

  describe("RULE: Must keep the stored password unless a new one is entered or the account is removed", () => {
    test("EXAMPLE: The one where ServiceControl 6.21.2 or later does not return the stored password and it is left empty, and the empty password is sent", async () => {
      /*
       * Given ServiceControl 6.21.2 or later, which does not return the stored password
       *   and keeps it when an empty one is sent
       * When the settings are saved with the password left empty
       * Then the empty password is sent
       */
      const componentDriver = renderComponent({ settingsInServiceControl: settingsWithoutPassword() });

      await componentDriver.actions.openEmailConfiguration();
      await componentDriver.actions.confirmEmailConfigurationChanges();
      componentDriver.verify.savedSettingsInclude({ authorization_account: "user@example.com", authorization_password: "" });
    });

    test("EXAMPLE: The one where ServiceControl older than 6.21.2 returns the stored password and it is left empty, and the stored password is sent back", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which returns the stored password
       *   and replaces it with whatever a save sends
       * When the settings are saved with the password left empty
       * Then the stored password is sent back with the save
       *   (sending the empty password would erase it)
       */
      const componentDriver = renderComponent({ settingsInServiceControl: settingsWithStoredPassword() });

      await componentDriver.actions.openEmailConfiguration();
      await componentDriver.actions.confirmEmailConfigurationChanges();
      componentDriver.verify.savedSettingsInclude({ authorization_account: "user@example.com", authorization_password: storedPassword });
    });

    test("EXAMPLE: The one where a new password is entered, and it replaces the stored one", async () => {
      /*
       * Given ServiceControl returns the stored password
       * When a new password is entered and the settings are saved
       * Then the new password is sent
       */
      const componentDriver = renderComponent({ settingsInServiceControl: settingsWithStoredPassword() });

      await componentDriver.actions.openEmailConfiguration();
      await componentDriver.actions.enterPassword("new-secret");
      await componentDriver.actions.confirmEmailConfigurationChanges();
      componentDriver.verify.savedSettingsInclude({ authorization_password: "new-secret" });
    });

    test("EXAMPLE: The one where the account is removed, and the password is removed with it", async () => {
      /*
       * Given ServiceControl returns the stored password
       * When the account is removed and the settings are saved with the password left empty
       * Then the empty password is sent, because without an account the password is never used
       */
      const componentDriver = renderComponent({ settingsInServiceControl: settingsWithStoredPassword() });

      await componentDriver.actions.openEmailConfiguration();
      await componentDriver.actions.removeAccount();
      await componentDriver.actions.confirmEmailConfigurationChanges();
      componentDriver.verify.savedSettingsInclude({ authorization_account: "", authorization_password: "" });
    });
  });

  describe("RULE: Should recommend limiting what the SMTP account can send", () => {
    test("EXAMPLE: The one where the dialog opens, and it recommends a dedicated SMTP account with limited send permissions", async () => {
      /*
       * When the Email configuration popup is opened
       * Then it recommends a dedicated SMTP account with limited send permissions
       * And it links to the documentation
       */
      const componentDriver = renderComponent({ settingsInServiceControl: emptyEmailSettings() });

      await componentDriver.actions.openEmailConfiguration();
      componentDriver.verify.limitingTheSmtpAccountIsRecommended();
    });
  });

  describe("RULE: Must show whether a test notification was delivered", () => {
    test("EXAMPLE: The one where the configuration is invalid, and the test notification is shown as failed", async () => {
      /*
       * Given an invalid configuration
       * When "Send test notification" is clicked
       * Then "TEST FAILED" is displayed
       */
      const componentDriver = renderComponent();
      const store = useHealthChecksStore();

      // Stub the action so it returns false (test notification failed)
      vi.mocked(store.testEmailNotifications).mockResolvedValue(false);

      await componentDriver.actions.requestTestNotification();
      componentDriver.verify.testNotificationWasRequested();
      await componentDriver.verify.testNotificationFailed();
    });

    test("EXAMPLE: The one where the configuration is valid, and the test notification is shown as sent", async () => {
      /*
       * Given a valid configuration
       * When "Send test notification" is clicked
       * Then "Test email sent successfully" is displayed
       */
      const componentDriver = renderComponent();
      const store = useHealthChecksStore();

      // Stub the action so it returns true (test notification succeeded)
      vi.mocked(store.testEmailNotifications).mockResolvedValue(true);

      await componentDriver.actions.requestTestNotification();
      componentDriver.verify.testNotificationWasRequested();
      await componentDriver.verify.testNotificationWasSuccessful();
    });
  });
});

// ─── Render helper ───────────────────────────────────────────────────────────

function renderComponent({ initialState = {}, settingsInServiceControl = emptyEmailSettings() }: { initialState?: InitialState; settingsInServiceControl?: EmailNotifications } = {}): ComponentDSL {
  const user = userEvent.setup();

  // The dialog reads and saves the settings it edits through ServiceControl's API, answered here by the mock server.
  const emailSettingsUrl = `${window.defaultConfig.service_control_url}notifications/email`;
  mockEndpoint(emailSettingsUrl, { body: settingsInServiceControl });
  const savedSettings: UpdateEmailNotificationsSettingsRequest[] = [];
  mockEndpointDynamic(emailSettingsUrl, "post", async (_url, _params, request) => {
    savedSettings.push((await request.json()) as UpdateEmailNotificationsSettingsRequest);
    return { body: {} };
  });

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
      async toggleEmailNotifications() {
        await user.click(screen.getByRole("switch", { name: /emailNotifications/i }));
      },
      async openEmailConfiguration() {
        await user.click(screen.getByRole("button", { name: /configure/i }));
        const dialog = screen.getByRole("dialog", { name: /email configuration/i });
        await waitFor(() => expect(within(dialog).queryByRole("status")).not.toBeInTheDocument());
      },
      async confirmEmailConfigurationChanges() {
        await user.click(screen.getByRole("button", { name: /save/i }));
        await waitFor(() => expect(screen.queryByRole("dialog", { name: /email configuration/i })).not.toBeInTheDocument());
      },
      async discardEmailConfigurationChanges() {
        await user.click(screen.getByRole("button", { name: /cancel/i }));
      },
      async requestTestNotification() {
        await user.click(screen.getByRole("button", { name: /send test notification/i }));
      },
      async enterPassword(password: string) {
        await user.type(screen.getByLabelText(/authentication password/i), password);
      },
      async removeAccount() {
        await user.clear(screen.getByLabelText(/authentication account/i));
      },
      settingsChangeInServiceControl(changes: Partial<EmailNotifications>) {
        mockEndpoint(emailSettingsUrl, { body: { ...settingsInServiceControl, ...changes } });
      },
      serviceControlBecomesUnreachable() {
        mockEndpoint(emailSettingsUrl, { body: null, networkError: true });
      },
      async provideValidEmailConfiguration() {
        await user.type(screen.getByLabelText(/smtp server address/i), "smtp.example.com");
        await user.type(screen.getByLabelText(/smtp server port/i), "587");
        await user.type(screen.getByLabelText(/from address/i), "from@example.com");
        await user.type(screen.getByLabelText(/to address/i), "to@example.com");
      },
    },
    verify: {
      emailNotificationsAreEnabled() {
        expect(screen.getByRole("switch", { name: /emailNotifications/i })).toHaveAttribute("aria-checked", "true");
      },
      emailNotificationsAreDisabled() {
        expect(screen.getByRole("switch", { name: /emailNotifications/i })).toHaveAttribute("aria-checked", "false");
      },
      emailConfigurationIsAccessible() {
        expect(screen.getByRole("dialog", { name: /email configuration/i })).toBeInTheDocument();
      },
      emailConfigurationIsNotAccessible() {
        expect(screen.queryByRole("dialog", { name: /email configuration/i })).not.toBeInTheDocument();
      },
      userCanSaveConfiguration() {
        expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
      },
      userCannotSaveConfiguration() {
        expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
      },
      async testNotificationWasSuccessful() {
        expect(await screen.findByText(/test email sent successfully/i)).toBeInTheDocument();
      },
      async testNotificationFailed() {
        expect(await screen.findByText(/test failed/i)).toBeInTheDocument();
      },
      emailNotificationsWereToggled() {
        expect(store.toggleEmailNotifications).toHaveBeenCalled();
      },
      testNotificationWasRequested() {
        expect(store.testEmailNotifications).toHaveBeenCalled();
      },
      emailConfigurationWasSaved() {
        expect(savedSettings).toHaveLength(1);
      },
      emailConfigurationWasNotSaved() {
        expect(savedSettings).toHaveLength(0);
      },
      savedSettingsInclude(settings: Partial<UpdateEmailNotificationsSettingsRequest>) {
        expect(savedSettings).toHaveLength(1);
        expect(savedSettings[0]).toMatchObject(settings);
      },
      storedPasswordIsNotShownAndCanBeKept() {
        const password = screen.getByLabelText(/authentication password/i);
        expect(password).toHaveValue("");
        expect(password).toHaveAttribute("placeholder", expect.stringMatching(/leave empty to keep the stored password/i));
        expect(password).toHaveAccessibleDescription(/stored password is never shown/i);
      },
      emailSettingsCouldNotBeLoaded() {
        expect(screen.getByRole("alert")).toHaveTextContent(/could not be loaded/i);
        expect(screen.queryByLabelText(/smtp server address/i)).not.toBeInTheDocument();
      },
      limitingTheSmtpAccountIsRecommended() {
        expect(screen.getByText(/use a dedicated smtp account/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /securing the smtp account/i })).toHaveAttribute("href", "https://docs.particular.net/servicecontrol/security/smtp-account");
      },
      emailConfigurationMatches(config: Partial<EmailNotifications>) {
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

function emptyEmailSettings(): EmailNotifications {
  return {
    enabled: false,
    enable_tls: false,
  };
}

// What ServiceControl 6.21.2 and later return for a valid configuration with an account: no password.
function settingsWithoutPassword(): EmailNotifications {
  return {
    enabled: true,
    enable_tls: true,
    smtp_server: "smtp.example.com",
    smtp_port: 587,
    authentication_account: "user@example.com",
    from: "from@example.com",
    to: "to@example.com",
  };
}

// What ServiceControl before 6.21.2 returns for the same configuration: the stored password too.
function settingsWithStoredPassword(): EmailNotifications {
  return { ...settingsWithoutPassword(), authentication_password: storedPassword };
}
