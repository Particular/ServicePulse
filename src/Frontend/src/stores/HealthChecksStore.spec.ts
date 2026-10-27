import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";

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
      const toggle = toggleSucceeds();

      await store.toggleEmailNotifications();

      expect(toggle).toHaveBeenCalledWith("notifications/email/toggle", { enabled: true });
      expect(store.emailNotifications.enabled).toBe(true);
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
      const toggle = toggleSucceeds();

      await store.toggleEmailNotifications();
      await store.toggleEmailNotifications();

      expect(toggle).toHaveBeenNthCalledWith(1, "notifications/email/toggle", { enabled: true });
      expect(toggle).toHaveBeenNthCalledWith(2, "notifications/email/toggle", { enabled: false });
      expect(store.emailNotifications.enabled).toBe(false);
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
      expect(store.emailNotifications.enabled).toBe(false);
    });
  });
});

describe("HealthChecksStore", () => {
  test("does not keep the SMTP password in memory after the settings are saved", async () => {
    vi.spyOn(serviceControlClient, "postToServiceControl").mockResolvedValue(new Response(null, { status: 200 }));
    const store = useHealthChecksStore();

    const saved = await store.saveEmailNotifications({
      smtp_server: "smtp.example.com",
      smtp_port: 587,
      authorization_account: "user@example.com",
      authorization_password: "secret",
      enable_tls: true,
      from: "from@example.com",
      to: "to@example.com",
    });

    expect(saved).toBe(true);
    expect(store.emailNotifications.authentication_password).toBe("");
  });
});

async function storeWithEmailNotifications({ enabled }: { enabled: boolean }) {
  vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([new Response(), { enabled, enable_tls: false }]);
  const store = useHealthChecksStore();
  await store.refresh();
  return store;
}

function toggleSucceeds() {
  return vi.spyOn(serviceControlClient, "postToServiceControl").mockResolvedValue(new Response(null, { status: 200 }));
}
