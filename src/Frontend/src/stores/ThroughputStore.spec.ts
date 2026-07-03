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
import type { ManifestEntry } from "@/stores/AllowedRoutesStore";

function makeRoutes(keys: string[]): Map<string, ManifestEntry> {
  return new Map(keys.map((k) => [k, { method: "", url_template: "" }]));
}

describe("ThroughputStore tests", () => {
  async function setup(preSetup: (driver: Driver) => Promise<void>, initialState?: Record<string, unknown>) {
    const driver = makeDriverForTests();
    setActivePinia(createTestingPinia({ stubActions: false, initialState }));

    await preSetup(driver);
    await driver.setUp(serviceControlWithThroughput);
    await driver.setUp(precondition.hasNoDisconnectedEndpoints);
    await driver.setUp(precondition.hasServiceControlMonitoringInstance);

    await useEnvironmentAndVersionsStore().refresh();

    const store = useThroughputStore();
    const refs = storeToRefs(store);
    await store.refresh();

    return { driver, ...refs };
  }

  test("when no connection test errors for any source", async () => {
    const { hasErrors } = await setup(async (driver) => {
      await driver.setUp(precondition.hasLicensingSettingTest({ transport: Transport.AmazonSQS }));
    });

    expect(hasErrors.value).toBe(false);
  });

  test("does not call the licensing connection test when lacking permission to view the license", async () => {
    let called = false;
    const { testResults } = await setup(
      async (driver) => {
        await driver.setUp(precondition.hasLicensingSettingTest({ transport: Transport.AmazonSQS }));
        driver.mockEndpointDynamic(`${window.defaultConfig.service_control_url}licensing/settings/test`, "get", () => {
          called = true;
          return Promise.resolve({ body: {} });
        });
      },
      {
        auth: { authEnabled: true, isAuthenticated: true },
        AllowedRoutesStore: { routes: makeRoutes([]), loaded: true, loadAttempted: true },
      }
    );

    expect(called).toBe(false);
    expect(testResults.value).toBe(null);
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
