import { beforeEach, describe, expect, test } from "vitest";
import * as precondition from "../../test/preconditions";
import { Transport } from "@/views/throughputreport/transport";
import { makeDriverForTests } from "@component-test-utils";
import { serviceControlWithThroughput } from "@/views/throughputreport/serviceControlWithThroughput";
import { useThroughputStore } from "@/stores/ThroughputStore";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia, storeToRefs } from "pinia";
import type { Driver } from "../../test/driver";
import { disableMonitoring } from "../../test/drivers/vitest/setup";
import { useEnvironmentAndVersionsStore } from "./EnvironmentAndVersionsStore";
import { useAllowedRoutesStore, type ManifestEntry } from "@/stores/AllowedRoutesStore";
import { useAuthStore } from "@/stores/AuthStore";

function makeRoutes(keys: string[]): Map<string, ManifestEntry> {
  return new Map(keys.map((k) => [k, { method: "", url_template: "" }]));
}

describe("ThroughputStore tests", () => {
  // Configures route gating on the live store instances (createTestingPinia's initialState does not
  // reliably hydrate a Map), matching the proven pattern in useAllowedRoutes.spec.ts. A token is
  // required so authFetch proceeds to the mocked endpoint once the gate lets the request through.
  function gateWithRoutes(routeKeys: string[]) {
    const auth = useAuthStore();
    auth.authEnabled = true;
    auth.isAuthenticated = true;
    auth.token = "test-token";
    const routesStore = useAllowedRoutesStore();
    routesStore.routes = makeRoutes(routeKeys);
    routesStore.loaded = true;
    routesStore.loadAttempted = true;
  }

  async function setup(preSetup: (driver: Driver) => Promise<void>, configureGating?: () => void) {
    const driver = makeDriverForTests();
    setActivePinia(createTestingPinia({ stubActions: false }));

    await preSetup(driver);
    await driver.setUp(serviceControlWithThroughput);
    await driver.setUp(precondition.hasNoDisconnectedEndpoints);
    await driver.setUp(precondition.hasServiceControlMonitoringInstance);

    await useEnvironmentAndVersionsStore().refresh();

    const store = useThroughputStore();
    const refs = storeToRefs(store);
    configureGating?.();
    await store.refresh();

    return { driver, ...refs };
  }

  test("when no connection test errors for any source", async () => {
    const { hasErrors } = await setup(async (driver) => {
      await driver.setUp(precondition.hasLicensingSettingTest({ transport: Transport.AmazonSQS }));
    });

    expect(hasErrors.value).toBe(false);
  });

  // The connection test hits licensing/settings/test, which ServiceControl guards with the
  // throughput-view route (/api/licensing/report/available) — NOT the license-view route
  // (/api/license). The gate must key on the exact route the endpoint requires, independent of
  // which other routes the manifest happens to grant (role-to-route bindings are not fixed).
  // `called` records whether the request got past the gate to the endpoint.
  async function setupGatedConnectionTest(routeKeys: string[]) {
    let called = false;
    await setup(
      (driver) => {
        driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}licensing/settings/test`, "get", () => {
          called = true;
          return Promise.resolve({ body: {} });
        });
        return Promise.resolve();
      },
      () => gateWithRoutes(routeKeys)
    );
    return { called: () => called };
  }

  test("does not call the connection test when the manifest grants the license route but not the throughput route", async () => {
    const { called } = await setupGatedConnectionTest(["GET /api/license"]);

    expect(called()).toBe(false);
  });

  describe("when transport is a broker", () => {
    const transport = Transport.AmazonSQS;

    test("with broker connection test failure", async () => {
      const { hasErrors } = await setup(async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport, broker_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
      });

      expect(hasErrors.value).toBe(true);
    });

    test("with monitoring connection test failure", async () => {
      const { hasErrors } = await setup(async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport, monitoring_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
      });

      expect(hasErrors.value).toBe(true);
    });

    test("with audit connection test failure", async () => {
      const { hasErrors } = await setup(async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport, audit_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
      });

      expect(hasErrors.value).toBe(true);
    });
  });

  describe("when transport is not a broker", () => {
    const transport = Transport.MSMQ;

    test("with monitoring connection test failure", async () => {
      const { hasErrors } = await setup(async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport, monitoring_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
      });

      expect(hasErrors.value).toBe(true);
    });

    test("with audit connection test failure", async () => {
      const { hasErrors } = await setup(async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport, audit_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
      });

      expect(hasErrors.value).toBe(true);
    });

    describe("with monitoring disabled", () => {
      beforeEach(() => {
        disableMonitoring();
      });

      test("with audit connection test failure", async () => {
        const { hasErrors } = await setup(async (driver) => {
          await driver.setUp(precondition.hasLicensingSettingTest({ transport, audit_connection_result: { connection_successful: false, connection_error_messages: [], diagnostics: "" } }));
        });

        expect(hasErrors.value).toBe(true);
      });

      test("with audit connection test passing", async () => {
        const { hasErrors } = await setup(async (driver) => {
          await driver.setUp(precondition.hasLicensingSettingTest({ transport, audit_connection_result: { connection_successful: true, connection_error_messages: [], diagnostics: "" } }));
        });

        expect(hasErrors.value).toBe(false);
      });
    });
  });
});
