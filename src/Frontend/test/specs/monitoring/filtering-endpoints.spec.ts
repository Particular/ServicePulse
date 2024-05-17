import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { enterFilterString } from "./actions/enterFilterString";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";
import { endpointGroupNames } from "./questions/endpointGroupNames";
import { endpointGroup } from "./questions/endpointGroup";
import { currentFilterValueToBe } from "./questions/currentFilterValueToBe";
import { endpointsNames } from "./questions/endpointsNames";
import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint filtering", () => {
  describe("Rule: List of monitoring endpoints should be filterable by the name", () => {
    [
      {
        description: "Filter string matches full endpoint name",
        filterString: "Universe.Solarsystem.Earth.Endpoint1",
        expectedEndpoints: ["Universe.Solarsystem.Earth.Endpoint1"],
      },
      {
        description: "Filter string matches a substring of only 1 endpoint name",
        filterString: "Endpoint1",
        expectedEndpoints: ["Universe.Solarsystem.Earth.Endpoint1"],
      },
      {
        description: "Filter string doesn't match any endpoint name",
        filterString: "WrongName",
        expectedEndpoints: [],
      },
    ].forEach(example => {
      it(`Example: ${example.description}`, async ({ driver }) => {
        // Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

        // Act
        await driver.goTo("monitoring");
        expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
        await enterFilterString(example.filterString);

        // Assert
        expect(await endpointsNames()).toEqual(example.expectedEndpoints);
      }); 
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
    [
      {description: "All lower case letters are used for a filter string that matches only 1 endpoint", filterString: "endpoint1"},
      {description: "All upper case letters are used for a filter string that matches only 1 endpoint", filterString: "ENDPOINT1"},
      {description: "A mix of upper and lower case letters are used for a filter string that matches only 1 endpoint", filterString: "EnDpOiNt1"}

    ].forEach((example) => {
      it(`Example: ${example.description}`, async ({ driver }) => {
        // Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));
  
        // Act
        await driver.goTo("monitoring");
        expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]);
        await enterFilterString(example.filterString);
  
        // Assert
        // Confirm only endpoint1 shows in the list after filtering
        expect(await endpointsNames()).toEqual(["Universe.Solarsystem.Earth.Endpoint1"]);
      });
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
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]);
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
      expect(endpointGroupNames()).toEqual([]);
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
      expect(await currentFilterValueToBe("Endpoint1")).toBeTruthy();
    });

    it("Example: The permalink's filter parameter is updated when a filter string is entered", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      //Act
      await driver.goTo("monitoring");
      await enterFilterString("Endpoint1");

      //Assert
      // Wait for the current page to change since the permalink should be different
      expect(window.location.href).not.toEqual("http://localhost:3000/#/monitoring");
      expect(window.location.href).toEqual("http://localhost:3000/#/monitoring?historyPeriod=1&filter=Endpoint1");
    });

    it("Example: The permalink's filter parameter is removed when filter string is empty", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      //Act
      await driver.goTo("monitoring?filter=Endpoint1");
      expect(await currentFilterValueToBe("Endpoint1")).toBeTruthy();
      await enterFilterString("");

      //Assert
      //Wait for the current page to change since the permalink should be different
      expect(window.location.href).not.toEqual("http://localhost:3000/#/monitoring?historyPeriod=1&filter=Endpoint1");
      expect(window.location.href).toEqual("http://localhost:3000/#/monitoring");
    });
  });
});
