import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor, screen } from "@testing-library/vue";

import * as precondition from "../../preconditions";

describe("FEATURE: Instance switching", () => {
  describe("Rule: A user should be able to view a list of monitoring instances", () => {
    it("Example: One monitoring instance is configured", async ({ driver }) => {
      //Arrange
      //await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.serviceControlWithMonitoringUrl("http://localhost:33644/"));
      //await driver.setUp(precondition.hasServiceControlMonitoringInstanceUrl(""));
      //await driver.setUp(precondition.hasServiceControlMainInstance);
      //await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1"]));

      //Act
      await driver.goTo("monitoring");
      /* await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("Universe.Solarsystem.Earth.Endpoint1"); */

      //Assert
      //Confirm Endpoint1 still shows in the list after filtering
      //expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();

      //Confirm Endpoint2 and Endpoint3 no longer shows in the list after filtering
      //expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      //expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });
  });
});
