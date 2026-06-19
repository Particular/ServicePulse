import { describe, test, expect, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import usePermissionGate from "@/composables/usePermissionGate";
import { useAuthStore } from "@/stores/AuthStore";
import { useUserPermissionsStore, type PermissionsSummary } from "@/stores/UserPermissionsStore";

const summaryWith = (overrides: Partial<PermissionsSummary> = {}): PermissionsSummary => ({
  failed_messages_read: false,
  failed_messages_write: false,
  auditing_read: false,
  monitoring_read: false,
  monitoring_write: false,
  admin_read: false,
  admin_write: false,
  ...overrides,
});

describe("usePermissionGate", () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
  });

  function withState(opts: { authEnabled: boolean; isAuthenticated: boolean; summary: PermissionsSummary | null }) {
    const auth = useAuthStore();
    auth.authEnabled = opts.authEnabled;
    auth.isAuthenticated = opts.isAuthenticated;
    useUserPermissionsStore().summary = opts.summary;
    return usePermissionGate();
  }

  test("fails open (shows everything) when authorization is disabled", () => {
    const { has, shouldGate } = withState({ authEnabled: false, isAuthenticated: true, summary: summaryWith() });

    expect(shouldGate.value).toBe(false);
    expect(has("admin_read")).toBe(true);
    expect(has("failed_messages_read")).toBe(true);
  });

  test("fails open when the user is not authenticated", () => {
    const { has, shouldGate } = withState({ authEnabled: true, isAuthenticated: false, summary: summaryWith() });

    expect(shouldGate.value).toBe(false);
    expect(has("admin_read")).toBe(true);
  });

  test("fails open while the permission summary has not loaded yet", () => {
    const { has, shouldGate } = withState({ authEnabled: true, isAuthenticated: true, summary: null });

    expect(shouldGate.value).toBe(false);
    expect(has("admin_read")).toBe(true);
  });

  test("gates per flag once enabled, authenticated and loaded", () => {
    const { has, shouldGate } = withState({ authEnabled: true, isAuthenticated: true, summary: summaryWith({ admin_read: true }) });

    expect(shouldGate.value).toBe(true);
    expect(has("admin_read")).toBe(true);
    expect(has("failed_messages_read")).toBe(false);
  });

  test("reacts to the summary being updated", () => {
    const auth = useAuthStore();
    auth.authEnabled = true;
    auth.isAuthenticated = true;
    const permissions = useUserPermissionsStore();
    permissions.summary = summaryWith();

    const { has } = usePermissionGate();
    expect(has("monitoring_read")).toBe(false);

    permissions.summary = summaryWith({ monitoring_read: true });
    expect(has("monitoring_read")).toBe(true);
  });
});
