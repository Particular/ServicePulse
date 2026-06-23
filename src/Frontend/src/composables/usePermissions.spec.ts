import { describe, test, expect, beforeEach, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";

vi.mock("@/components/serviceControlClient", () => ({
  default: { fetchFromServiceControl: vi.fn() },
}));

import serviceControlClient from "@/components/serviceControlClient";
import logger from "@/logger";
import { usePermissions } from "@/composables/usePermissions";
import { usePermissionsStore } from "@/stores/PermissionsStore";
import { useAuthStore } from "@/stores/AuthStore";

const fetchFromServiceControl = vi.mocked(serviceControlClient.fetchFromServiceControl);

// Minimal Response-like stub for the bits the composable reads.
function response(status: number, body?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `status ${status}`,
    json: () => Promise.resolve(body),
  } as Response;
}

function withState(opts: { authEnabled: boolean; isAuthenticated: boolean; permissions: string[] | null }) {
  const auth = useAuthStore();
  auth.authEnabled = opts.authEnabled;
  auth.isAuthenticated = opts.isAuthenticated;
  if (opts.permissions !== null) {
    usePermissionsStore().setDescriptor({ user: "alice", permissions: opts.permissions });
  }
  return usePermissions();
}

describe("usePermissions", () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
    fetchFromServiceControl.mockReset();
  });

  describe("can / canAny (fail-open gating)", () => {
    test("fails open when authorization is disabled", () => {
      const { can, shouldGate } = withState({ authEnabled: false, isAuthenticated: true, permissions: [] });
      expect(shouldGate.value).toBe(false);
      expect(can("error:messages:retry")).toBe(true);
    });

    test("fails open when the user is not authenticated", () => {
      const { can } = withState({ authEnabled: true, isAuthenticated: false, permissions: [] });
      expect(can("error:messages:retry")).toBe(true);
    });

    test("fails open until the descriptor has loaded", () => {
      const { can } = withState({ authEnabled: true, isAuthenticated: true, permissions: null });
      expect(can("error:messages:retry")).toBe(true);
    });

    test("gates per permission once enabled, authenticated and loaded", () => {
      const { can, shouldGate } = withState({ authEnabled: true, isAuthenticated: true, permissions: ["error:messages:view"] });
      expect(shouldGate.value).toBe(true);
      expect(can("error:messages:view")).toBe(true);
      expect(can("error:messages:retry")).toBe(false);
    });

    test("canAny is true when any permission is held", () => {
      const { canAny } = withState({ authEnabled: true, isAuthenticated: true, permissions: ["error:redirects:view"] });
      expect(canAny(["error:licensing:view", "error:redirects:view"])).toBe(true);
      expect(canAny(["error:licensing:view", "error:notifications:view"])).toBe(false);
    });
  });

  describe("fetchDescriptor", () => {
    test("200 fetches my/permissions/all and populates the store", async () => {
      const { fetchDescriptor } = withState({ authEnabled: true, isAuthenticated: true, permissions: null });
      fetchFromServiceControl.mockResolvedValue(response(200, { user: "alice", permissions: ["error:messages:view"] }));

      await fetchDescriptor();

      expect(fetchFromServiceControl).toHaveBeenCalledWith("my/permissions/all");
      const store = usePermissionsStore();
      expect(store.loaded).toBe(true);
      expect(store.permissions.has("error:messages:view")).toBe(true);
    });

    test("a non-OK response leaves the store intact and warns", async () => {
      const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
      const { fetchDescriptor } = withState({ authEnabled: true, isAuthenticated: true, permissions: ["error:messages:view"] });
      fetchFromServiceControl.mockResolvedValue(response(401));

      await fetchDescriptor();

      expect(usePermissionsStore().permissions.has("error:messages:view")).toBe(true); // unchanged
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    test("a thrown request is logged and leaves the store intact", async () => {
      const error = vi.spyOn(logger, "error").mockImplementation(() => {});
      const failure = new Error("boom");
      const { fetchDescriptor } = withState({ authEnabled: true, isAuthenticated: true, permissions: null });
      fetchFromServiceControl.mockRejectedValue(failure);

      await fetchDescriptor();

      expect(usePermissionsStore().loaded).toBe(false);
      expect(error).toHaveBeenCalledWith("Error fetching permissions", failure);
      error.mockRestore();
    });

    test("concurrent calls share a single in-flight request", async () => {
      let resolveFetch: (value: Response) => void = () => {};
      const pending = new Promise<Response>((resolve) => (resolveFetch = resolve));
      fetchFromServiceControl.mockReturnValue(pending);

      const { fetchDescriptor } = withState({ authEnabled: true, isAuthenticated: true, permissions: null });
      const first = fetchDescriptor();
      const second = fetchDescriptor();

      expect(fetchFromServiceControl).toHaveBeenCalledTimes(1);

      resolveFetch(response(200, { user: "alice", permissions: [] }));
      await Promise.all([first, second]);

      // Slot released after settling, so a later call fetches again.
      await fetchDescriptor();
      expect(fetchFromServiceControl).toHaveBeenCalledTimes(2);
    });
  });
});
