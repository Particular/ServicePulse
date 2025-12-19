/**
 * Shared helper for creating mock scenarios.
 *
 * This module provides a factory function that creates all the boilerplate
 * needed for a mock scenario: the MSW worker, mock endpoint functions, and driver.
 */
import { setupWorker, SetupWorker } from "msw/browser";
import { Driver, SetupFactoryOptions } from "../../driver";
import { makeMockEndpoint, makeMockEndpointDynamic } from "../../mock-endpoint";

type SetupFactory = ({ driver }: SetupFactoryOptions) => Promise<unknown>;

export interface ScenarioSetup {
  worker: SetupWorker;
  driver: Driver;
  runScenario: (scenarioFn: SetupFactory) => Promise<void>;
}

/**
 * Creates the worker, mock endpoint functions, and driver for a scenario.
 */
export function createScenario(): ScenarioSetup {
  const worker = setupWorker();
  const mockEndpoint = makeMockEndpoint({ mockServer: worker });
  const mockEndpointDynamic = makeMockEndpointDynamic({ mockServer: worker });

  const driver: Driver = {
    goTo() {
      throw new Error("Not implemented");
    },
    mockEndpoint,
    mockEndpointDynamic,
    setUp(factory) {
      return factory({ driver: this });
    },
    disposeApp() {
      throw new Error("Not implemented");
    },
  };

  const runScenario = async (scenarioFn: SetupFactory): Promise<void> => {
    await driver.setUp(scenarioFn);
  };

  return { worker, driver, runScenario };
}
