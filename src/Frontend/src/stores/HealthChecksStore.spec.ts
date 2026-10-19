import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import type EmailNotifications from "@/resources/EmailNotifications";
import type UpdateEmailNotificationsSettingsRequest from "@/resources/UpdateEmailNotificationsSettingsRequest";

const storedPassword = "stored-secret";

// ServiceControl 6.21.2 made the SMTP password write-only: it no longer returns it, and an empty password keeps the
// stored one. Earlier versions return it, and replace the stored password with whatever a save sends.
const writeOnlyServiceControl = "6.21.2";
const olderServiceControl = "6.21.1";

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FEATURE: The stored SMTP password is write-only", () => {
  describe("RULE: Must not hold on to the SMTP password", () => {
    test("EXAMPLE: The one where ServiceControl older than 6.21.2 returns the stored password when the page loads, and it is not kept", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which returns the stored password
       * When the page loads the email notification settings
       * Then whether notifications are enabled is known
       * And the password is not kept
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      const store = useHealthChecksStore();

      await store.refresh();

      expect(store.emailNotificationsEnabled).toBe(true);
      expect(JSON.stringify(store.$state)).not.toContain(storedPassword);
    });

    test("EXAMPLE: The one where ServiceControl older than 6.21.2 returns the stored password when the dialog opens, and the dialog never gets it", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which returns the stored password
       * When the email configuration dialog loads the settings it edits
       * Then it gets every setting except the password
       * And the password is not kept
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      const store = useHealthChecksStore();

      const settings = await store.loadEmailSettings();

      expect(settings).toEqual({
        enable_tls: true,
        smtp_server: "smtp.example.com",
        smtp_port: 587,
        authentication_account: "user@example.com",
        from: "from@example.com",
        to: "to@example.com",
      });
      expect(JSON.stringify(store.$state)).not.toContain(storedPassword);
    });

    test("EXAMPLE: The one where the stored password is sent back while saving, and it is not kept afterwards", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which returns the stored password
       * When the settings are saved with the password left empty
       * Then the stored password is sent back with the save (see the next rule)
       * And it is not kept after the save
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      postSucceeds();
      const store = useHealthChecksStore();

      await store.saveEmailNotifications(saveRequest({ authorization_password: "" }));

      expect(JSON.stringify(store.$state)).not.toContain(storedPassword);
    });

    test("EXAMPLE: The one where a new password is saved, and it is not kept afterwards", async () => {
      /*
       * Given ServiceControl 6.21.2 or later
       * When the settings are saved with a new password
       * Then the new password is not kept after the save
       */
      serviceControlIsVersion(writeOnlyServiceControl);
      postSucceeds();
      const store = useHealthChecksStore();

      await store.saveEmailNotifications(saveRequest({ authorization_password: "new-secret" }));

      expect(JSON.stringify(store.$state)).not.toContain("new-secret");
    });
  });

  describe("RULE: Must keep the stored password unless a new one is entered or the account is removed", () => {
    test("EXAMPLE: The one where the password is left empty on ServiceControl 6.21.2 or later, and the stored password is kept", async () => {
      /*
       * Given ServiceControl 6.21.2 or later, which keeps the stored password when an empty one is sent
       * When the settings are saved with the password left empty
       * Then the empty password is sent as it is
       * And the stored password is not read first
       */
      serviceControlIsVersion(writeOnlyServiceControl);
      serviceControlReturns(settingsWithoutPassword());
      const post = postSucceeds();
      const store = useHealthChecksStore();

      const saved = await store.saveEmailNotifications(saveRequest({ authorization_password: "" }));

      expect(saved).toBe(true);
      expect(serviceControlClient.fetchTypedFromServiceControl).not.toHaveBeenCalled();
      expect(post).toHaveBeenCalledWith("notifications/email", saveRequest({ authorization_password: "" }));
    });

    test("EXAMPLE: The one where the password is left empty on ServiceControl older than 6.21.2, and the stored password is still kept", async () => {
      /*
       * Given ServiceControl older than 6.21.2, which replaces the stored password with whatever a save sends
       * When the settings are saved with the password left empty
       * Then the stored password is read from ServiceControl and sent back with the save
       *   (sending the empty password would erase it)
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      const post = postSucceeds();
      const store = useHealthChecksStore();

      const saved = await store.saveEmailNotifications(saveRequest({ authorization_password: "" }));

      expect(saved).toBe(true);
      expect(post).toHaveBeenCalledWith("notifications/email", saveRequest({ authorization_password: storedPassword }));
    });

    test("EXAMPLE: The one where a new password is entered, and it replaces the stored one", async () => {
      /*
       * Given ServiceControl older than 6.21.2, the only versions where the stored password could be read
       * When the settings are saved with a new password
       * Then the new password is sent
       * And the stored password is not read
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      const post = postSucceeds();
      const store = useHealthChecksStore();

      await store.saveEmailNotifications(saveRequest({ authorization_password: "new-secret" }));

      expect(serviceControlClient.fetchTypedFromServiceControl).not.toHaveBeenCalled();
      expect(post).toHaveBeenCalledWith("notifications/email", saveRequest({ authorization_password: "new-secret" }));
    });

    test("EXAMPLE: The one where the account is removed, and the password is removed with it", async () => {
      /*
       * Given ServiceControl older than 6.21.2
       * When the settings are saved without an account and with the password left empty
       * Then the empty password is sent, because without an account the password is never used
       * And the stored password is not read
       */
      serviceControlIsVersion(olderServiceControl);
      serviceControlReturns(settingsWithStoredPassword());
      const post = postSucceeds();
      const store = useHealthChecksStore();

      await store.saveEmailNotifications(saveRequest({ authorization_account: "", authorization_password: "" }));

      expect(serviceControlClient.fetchTypedFromServiceControl).not.toHaveBeenCalled();
      expect(post).toHaveBeenCalledWith("notifications/email", saveRequest({ authorization_account: "", authorization_password: "" }));
    });

    test("COUNTER-EXAMPLE: The one where ServiceControl older than 6.21.2 cannot be reached to read the stored password, and the save is refused", async () => {
      /*
       * Given ServiceControl older than 6.21.2
       * And the stored password cannot be read from it
       * When the settings are saved with the password left empty
       * Then the save fails and nothing is sent, rather than erasing the stored password
       */
      serviceControlIsVersion(olderServiceControl);
      vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockRejectedValue(new Error("ServiceControl is unavailable"));
      const post = postSucceeds();
      const store = useHealthChecksStore();

      const saved = await store.saveEmailNotifications(saveRequest({ authorization_password: "" }));

      expect(saved).toBe(false);
      expect(post).not.toHaveBeenCalled();
    });
  });
});

function serviceControlIsVersion(version: string) {
  useEnvironmentAndVersionsStore().environment.sc_version = version;
}

function serviceControlReturns(settings: EmailNotifications) {
  vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([new Response(), settings]);
}

function postSucceeds() {
  return vi.spyOn(serviceControlClient, "postToServiceControl").mockResolvedValue(new Response(null, { status: 200 }));
}

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

function settingsWithStoredPassword(): EmailNotifications {
  return { ...settingsWithoutPassword(), authentication_password: storedPassword };
}

function saveRequest(overrides: Partial<UpdateEmailNotificationsSettingsRequest> = {}): UpdateEmailNotificationsSettingsRequest {
  return {
    smtp_server: "smtp.example.com",
    smtp_port: 587,
    authorization_account: "user@example.com",
    authorization_password: "",
    enable_tls: true,
    from: "from@example.com",
    to: "to@example.com",
    ...overrides,
  };
}
