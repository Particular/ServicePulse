/**
 * Shared setup for licensing scenarios: the default dev-mocks data
 * (failed messages, custom checks, monitored endpoints) with a given license.
 */
import type { SetupFactoryOptions } from "../../../driver";
import * as precondition from "../../../preconditions";

type SetupFactory = (options: SetupFactoryOptions) => unknown;

export const withDefaultDataAndLicense =
  (license: SetupFactory) =>
  async ({ driver }: SetupFactoryOptions) => {
    await driver.setUp(precondition.serviceControlWithMonitoring);
    await driver.setUp(precondition.hasCustomChecks(3, 2));
    await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Mercury.Endpoint1", "Universe.Solarsystem.Venus.Endpoint3", "Universe.Solarsystem.Earth.Endpoint5"]));
    await driver.setUp(
      precondition.hasFailedMessage({
        withGroupId: "81dca64e-76fc-e1c3-11a2-3069f51c58c8",
        withMessageId: "40134401-bab9-41aa-9acb-b19c0066f22d",
        withContentType: "application/json",
        withBody: { Index: 0, Data: "" },
      })
    );
    await driver.setUp(license);
  };
