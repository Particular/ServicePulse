import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { useHealthChecksStore } from "@/stores/HealthChecksStore";

describe("HealthChecksStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

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
