import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import serviceControlClient from "@/components/serviceControlClient";
import { useAuthStore } from "@/stores/AuthStore";

describe("AuthStore tests", () => {
  const baseResponse = {
    enabled: true,
    role_based_authorization_enabled: true,
    client_id: "test-client-id",
    authority: "https://login.example.com",
    api_scopes: JSON.stringify(["api://test-audience/.default"]),
    audience: "api://test-audience",
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("uses the composed scopes field from ServiceControl when present", async () => {
    vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([
      {} as Response,
      {
        ...baseResponse,
        scopes: "api://test-audience/.default openid profile email",
      },
    ]);

    const store = useAuthStore();
    await store.refresh();

    expect(store.authConfig?.scope).toBe("api://test-audience/.default openid profile email");
  });

  test("falls back to assembling scopes from api_scopes when talking to an older ServiceControl", async () => {
    // Older ServiceControl versions don't send the `scopes` field at all.
    vi.spyOn(serviceControlClient, "fetchTypedFromServiceControl").mockResolvedValue([{} as Response, { ...baseResponse }]);

    const store = useAuthStore();
    await store.refresh();

    expect(store.authConfig?.scope).toBe("api://test-audience/.default openid profile email offline_access");
  });
});
