import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor, screen } from "@testing-library/vue";
import { enterFilterString } from "./actions/enterFilterString";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";
import { endpointGroupNames } from "./questions/endpointGroupNames";
import { endpointGroup } from "./questions/endpointGroup";
import { filteredByName } from "./questions/filteredByName";
import { endpointsNames } from "./questions/endpointsNames";
import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint filtering", () => {
  describe("RULE: List of monitoring endpoints should be filterable by the name", () => {
    it("Example: Filter string matches full endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1","Universe.Solarsystem.Earth.Endpoint2","Universe.Solarsystem.Earth.Endpoint3"]);
      
      await enterFilterString("Universe.Solarsystem.Earth.Endpoint1");

      //Assert
      //Expect Endpoint1 to be the only endpoint that still shows in the list after filtering   
      //confirming that Endpoint2 and Endpoint3 no longer shows in the list after filtering   
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);            
    });
    it("Example: Filter string matches a substring of only 1 endpoint name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1","Universe.Solarsystem.Earth.Endpoint2","Universe.Solarsystem.Earth.Endpoint3"]);
      await enterFilterString("Endpoint1");

      //Assert
      //Expect Endpoint1 to be the only endpoint that still shows in the list after filtering   
      //confirming that Endpoint2 and Endpoint3 no longer show in the list after filtering   
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);
    });

    it("Example: Filter string doesn't match any endpoint name", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
      await enterFilterString("WrongName");

      // Assert
      // Confirm no endpoints show in the list after filtering
      expect(await endpointsNames()).toEqual([]);
    });

    it("Example: Enter filter string that matches 1 endpoint and clearing the filter string should display all endpoints", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);

      await enterFilterString("Endpoint1");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);

      await enterFilterString("");

      // Assert
      // Confirm all endpoints show in the list after clearing the filter string
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
    });

    it("Example: No filter string is entered and all endpoints should be displayed", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");

      // Assert
      // Confirm all endpoints show in the list after clearing the filter string
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
    });
  });

  describe("Rule: Filtering by endpoint name should be case insensitive", () => {
    it("Example: All upper case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
      await enterFilterString("ENDPOINT1");

      // Assert
      // Expect Endpoint1 to be the only endpoint that still shows in the list after filtering
      // confirming that Endpoint2 and Endpoint3 no longer show in the list after filtering
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);
    });

    it("Example: All lower case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
      await enterFilterString("endpoint1");

      // Assert
      // Expect Endpoint1 to be the only endpoint that still shows in the list after filtering
      // confirming that Endpoint2 and Endpoint3 no longer show in the list after filtering
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);
    });

    it("Example: A mix of upper and lower case letters are used for a filter string that matches only 1 endpoint", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      // Act
      await driver.goTo("monitoring");
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
      await enterFilterString("EnDpOiNt1");

      // Assert
      // Confirm only endpoint1 shows in the list after filtering
      expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);
    });
  });

  describe("Rule: Filtering by endpoint name should be possible when endpoints are grouped", () => {
    it("Example: Filter string matches only 1 endpoint in only 1 group", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
        ])
      );

      // Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 3 });
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      await enterFilterString("Endpoint1");

      // Assert
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Mercury"]);
      expect(await endpointsNames()).toEqual(["Endpoint1"]);
    });

    it("Example: Filter string matches all endpoints in each group", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
        ])
      );

      // Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 3 });
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      await enterFilterString("Endpoint");

      // Assert
      await waitFor(() => expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]));
      expect(await endpointsNames()).toEqual([
        "Endpoint5",
        "Endpoint6",
        "Endpoint1",
        "Endpoint2",
        "Endpoint3",
        "Endpoint4",
      ]);
    });

    it("Example: Filter string doesn't match any endpoints in any groups", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
        ])
      );

      // Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 3 });
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      await enterFilterString("WrongName");

      // Assert
      await waitFor(() => expect(endpointGroupNames()).toEqual([]));
      expect(await endpointsNames()).toEqual([]);
    });
  });

  describe("Rule: Filter string can get and set the filter parameter in the permalink", () => {
    it("Example: Filter string should be updated when the permalink has the filter parameter set", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      //Act
      await driver.goTo("monitoring?filter=Endpoint1");

      //Assert
      expect(await filteredByName("Endpoint1")).toBeInTheDocument();
    });

    it("Example: The permalink's filter parameter is updated when a filter string is entered", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      //Act
      await driver.goTo("monitoring");
      await enterFilterString("Endpoint1");

      //Assert
      // Wait for the current page to change since the permalink should be different
      await waitFor(() => expect(window.location.href).not.toEqual("http://localhost:3000/#/monitoring"));
      await waitFor(() => expect(window.location.href).toEqual("http://localhost:3000/#/monitoring?historyPeriod=1&filter=Endpoint1"));
    });

    it("Example: The permalink's filter parameter is removed when filter string is empty", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      //Act
      await driver.goTo("monitoring?filter=Endpoint1");
      expect(await filteredByName("Endpoint1")).toBeInTheDocument();
      await enterFilterString("");

      //Assert
      //Wait for the current page to change since the permalink should be different
      expect(window.location.href).not.toEqual("http://localhost:3000/#/monitoring?historyPeriod=1&filter=Endpoint1");
      expect(window.location.href).toEqual("http://localhost:3000/#/monitoring");
    });
  });
});
