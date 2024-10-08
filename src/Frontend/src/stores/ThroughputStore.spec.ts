import { beforeEach, describe, expect, test } from "vitest";
import * as precondition from "../../test/preconditions";
import { useServiceControl } from "@/composables/serviceServiceControl";
import { useServiceControlUrls } from "@/composables/serviceServiceControlUrls";
import { Transport } from "@/views/throughputreport/transport";
import { makeDriverForTests } from "@component-test-utils";
import { serviceControlWithThroughput } from "@/views/throughputreport/serviceControlWithThroughput";
import { useThroughputStore } from "@/stores/ThroughputStore";
import { createTestingPinia } from "@pinia/testing";
import { storeToRefs } from "pinia";
import flushPromises from "flush-promises";
import { Driver } from "../../test/driver";
import { disableMonitoring } from "../../test/drivers/vitest/setup";

describe("ThroughputStore tests", () => {
  async function setup(preSetup: (driver: Driver) => Promise<void>) {
    const driver = makeDriverForTests();

    await preSetup(driver);
    await driver.setUp(serviceControlWithThroughput);
    await driver.setUp(precondition.hasNoDisconnectedEndpoints);
    await driver.setUp(precondition.hasServiceControlMonitoringInstance);

    useServiceControlUrls();
    await useServiceControl();

    const store = storeToRefs(useThroughputStore(createTestingPinia({ stubActions: false })));

    await flushPromises();

    return { driver, ...store };
  }

  test("when no connection test errors for any source", async () => {
    const { hasErrors } = await setup(async (driver) => {
      await driver.setUp(precondition.hasLicensingSettingTest({ transport: Transport.AmazonSQS }));
    });

    expect(hasErrors.value).toBe(false);
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
