import { beforeEach, describe, expect, test } from "vitest";
import { getPlatformHealthCustomChecks, installPlatformHealthDevControls } from "./platform-health-state";

describe("platform-health-state", () => {
  beforeEach(() => {
    installPlatformHealthDevControls();
    window.__platformHealth?.reset();
  });

  test("applies built-in and user custom check presets independently of topology scenario", () => {
    window.__platformHealth?.setScenario("audit-remotes-healthy");
    window.__platformHealth?.setCustomCheckPreset("mixed-primary-and-user");

    const state = window.__platformHealth?.getState();
    const checks = getPlatformHealthCustomChecks();

    expect(state?.scenario).toBe("audit-remotes-healthy");
    expect(state?.customCheckPreset).toBe("mixed-primary-and-user");
    expect(checks).toHaveLength(2);
    expect(checks.some((check) => check.custom_check_id === "ServiceControl Primary Instance")).toBe(true);
    expect(checks.some((check) => check.category === "User defined")).toBe(true);
  });

  test("allows explicit custom checks to replace a preset", () => {
    window.__platformHealth?.setCustomCheckPreset("platform-only-primary");
    window.__platformHealth?.setCustomChecks([]);

    expect(window.__platformHealth?.getCustomChecks()).toEqual([]);
  });

  test("supports a degraded primary platform custom check preset", () => {
    window.__platformHealth?.setScenario("audit-remotes-healthy");
    window.__platformHealth?.setCustomCheckPreset("platform-only-primary-degraded");

    const state = window.__platformHealth?.getState();
    const checks = getPlatformHealthCustomChecks();

    expect(state?.customCheckPreset).toBe("platform-only-primary-degraded");
    expect(checks).toHaveLength(1);
    expect(checks[0].custom_check_id).toBe("Error Message Ingestion Process");
    expect(checks[0].category).toBe("ServiceControl Health");
  });

  test("keeps healthy audit remote topology healthy until a related audit custom check is applied", () => {
    window.__platformHealth?.setScenario("audit-remotes-healthy");

    const state = window.__platformHealth?.getState();

    expect(state?.remotes[1].status).toBe("healthy");
  });

  test("targets the audit degraded preset at a specific audit instance name", () => {
    window.__platformHealth?.setCustomCheckPreset("platform-only-audit");

    const checks = getPlatformHealthCustomChecks();

    expect(checks).toHaveLength(1);
    expect(checks[0].originating_endpoint.name).toBe("Particular.ServiceControl.Audit-Blue");
  });
});
