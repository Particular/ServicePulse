import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";
import type EmailNotifications from "@/resources/EmailNotifications";

const storedPassword = "stored-secret";

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
      vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([new Response(), settingsWithStoredPassword()]);
      const store = useHealthChecksStore();

      await store.refresh();

      expect(store.emailNotificationsEnabled).toBe(true);
      expect(JSON.stringify(store.$state)).not.toContain(storedPassword);
    });
  });
});

function settingsWithStoredPassword(): EmailNotifications {
  return {
    enabled: true,
    enable_tls: true,
    smtp_server: "smtp.example.com",
    smtp_port: 587,
    authentication_account: "user@example.com",
    authentication_password: storedPassword,
    from: "from@example.com",
    to: "to@example.com",
  };
}
