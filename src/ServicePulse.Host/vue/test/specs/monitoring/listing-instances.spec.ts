import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen, waitFor } from "@testing-library/vue";
import { endpointWithName } from "./questions/endpointWithName";
import { monitoringInstanceOptions } from "./questions/monitoringInstanceOptions";
import { openMonitoringInstanceOptions } from "./actions/openMonitoringInstanceOptions";

import * as precondition from "../../preconditions";

describe("FEATURE: Instance switching", () => {
  describe("Rule: A user should be able to view a list of monitoring instances", () => {
    it("Example: Monitoring instance other than default is configured", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoringUrl("http://localhost:33644/"));
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1"]));

      //Act
      await driver.goTo("monitoring");

      //Assert
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
    });

    it("Example: All monitoring urls in app.config.js is displayed in the monitoring instance combobox", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoringUrl("http://localhost:33644/"));
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1"]));

      //Act
      await driver.goTo("monitoring");
      await openMonitoringInstanceOptions();
      const listOfMonitoringInstances = await monitoringInstanceOptions();

      //Assert
      await waitFor(() => expect(listOfMonitoringInstances.length).toBe(1));
      await waitFor(() => expect(listOfMonitoringInstances).toEqual(["http://localhost:33644/"]));
    });
  });
});
