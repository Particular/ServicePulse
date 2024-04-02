import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor } from "@testing-library/vue";
import { enterFilterString } from "./actions/enterFilterString";
import { endpointWithName } from "./questions/endpointWithName";
import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint filtering", () => {
  describe("RULE: List of monitoring endpoints should be filterable by the name", () => {
    it("Example: Filtering by an endpoint by the full endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //await waitFor(() => screen.getByText("Endpoints overview"));
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      //expect(endpointWithName2("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument();
      await enterFilterString("Universe.Solarsystem.Earth.Endpoint1");
      //screen.logTestingPlaygroundURL();

      //Assert
      //Confirm Endpoint1 still shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();

      //Confirm Endpoint2 and Endpoint3 no longer shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
      //expect(async () => await endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).rejects.toThrow();
      //expect(async () => await endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).rejects.toThrow();
    });
    it("Example: Filter string matches a substring of only 1 endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //await waitFor(() => screen.getByText("Endpoints overview"));
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      //expect(endpointWithName2("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument();
      //expect(await endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument();
      await enterFilterString("Endpoint1");
      //screen.logTestingPlaygroundURL();

      //Assert
      //Confirm Endpoint1 still shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();

      //Confirm Endpoint2 and Endpoint3 no longer shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
      //expect(async () => await endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).rejects.toThrow();
      //expect(async () => await endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).rejects.toThrow();
    });
  });
});
