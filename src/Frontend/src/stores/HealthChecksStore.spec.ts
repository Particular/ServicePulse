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

describe("FEATURE: Turning email notifications on and off", () => {
  describe("RULE: Must switch email notifications to the opposite of what is shown", () => {
    test("EXAMPLE: The one where email notifications are off and get switched on, and they are shown as on", async () => {
      /*
       * Given email notifications are off
       * When they are switched
       * Then ServiceControl is asked to turn them on
       * And they are shown as on
       */
      const store = await storeWithEmailNotifications({ enabled: false });
      const toggle = postSucceeds();

      await store.toggleEmailNotifications();

      expect(toggle).toHaveBeenCalledWith("notifications/email/toggle", { enabled: true });
      expect(store.emailNotificationsEnabled).toBe(true);
    });

    test("EXAMPLE: The one where email notifications are switched on and then off again without reloading, and they are turned off", async () => {
      /*
       * Given email notifications are off
       * When they are switched on
       * And then switched again without reloading the page
       * Then ServiceControl is asked to turn them on, and then off
       * And they are shown as off
       */
      const store = await storeWithEmailNotifications({ enabled: false });
      const toggle = postSucceeds();

      await store.toggleEmailNotifications();
      await store.toggleEmailNotifications();

      expect(toggle).toHaveBeenNthCalledWith(1, "notifications/email/toggle", { enabled: true });
      expect(toggle).toHaveBeenNthCalledWith(2, "notifications/email/toggle", { enabled: false });
      expect(store.emailNotificationsEnabled).toBe(false);
    });

    test("COUNTER-EXAMPLE: The one where ServiceControl rejects the change, and they are shown as they were", async () => {
      /*
       * Given email notifications are off
       * When they are switched
       * And ServiceControl rejects the change
       * Then they are shown as off
       */
      const store = await storeWithEmailNotifications({ enabled: false });
      vi.spyOn(serviceControlClient, "postToServiceControl").mockResolvedValue(new Response(null, { status: 500 }));

      const toggled = await store.toggleEmailNotifications();

      expect(toggled).toBe(false);
      expect(store.emailNotificationsEnabled).toBe(false);
    });
  });
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

async function storeWithEmailNotifications({ enabled }: { enabled: boolean }) {
  vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([new Response(), { enabled, enable_tls: false }]);
  const store = useHealthChecksStore();
  await store.refresh();
  return store;
}

function postSucceeds() {
  return vi.spyOn(serviceControlClient, "postToServiceControl").mockResolvedValue(new Response(null, { status: 200 }));
}

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
