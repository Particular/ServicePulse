import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor } from "@testing-library/vue";
import { enterFilterString } from "./actions/enterFilterString";
import { endpointWithName } from "./questions/endpointWithName";
import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint filtering", () => {
  describe("RULE: List of monitoring endpoints should be filterable by the name", () => {
    it("Example: Filter string matches full endpoint name", async ({ driver }) => {
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
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("Endpoint1");

      //Assert
      //Confirm Endpoint1 still shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      //Confirm Endpoint2 and Endpoint3 no longer shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });

    it("Example: Filter string doesn't match any endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("WrongName");

      //Assert
      //Confirm no endpoints shows in the list after filtering
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });

    it("Example: Enter filter string that matches 1 endpoint and clearing the filter string should display all endpoints", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("Endpoint1");
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
      await enterFilterString("");

      //Assert
      //Confirm all endpoints shows in the list after clearing the filter string
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument();
    });

    it("Example: No filter string is entered and all endpoints should be displayed", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //Assert
      //Confirm all endpoints shows in the list after clearing the filter string
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
    });
  });

  describe("Rule: Filtering by endpoint name should be case insensitive", () => {
    it("Example: All upper case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("ENDPOINT1");

      //Assert
      //Confirm all endpoints shows in the list after clearing the filter string
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });

    it("Example: All lower case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("endpoint1");

      //Assert
      //Confirm all endpoints shows in the list after clearing the filter string
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });

    it("Example: A mix of upper and lower case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeInTheDocument());
      await waitFor(() => expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeInTheDocument());
      await enterFilterString("EnDpOiNt1");

      //Assert
      //Confirm all endpoints shows in the list after clearing the filter string
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint1")).toBeInTheDocument();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint2")).toBeNull();
      expect(endpointWithName("Universe.Solarsystem.Earth.Endpoint3")).toBeNull();
    });
  })
});
