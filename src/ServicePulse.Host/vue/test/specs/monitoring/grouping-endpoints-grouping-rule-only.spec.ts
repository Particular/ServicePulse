import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { endpointsGroupsNames } from "./questions/endpointsGroupsNames";
import { endpointGroup } from "./questions/endpointGroupEndpoints";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";

//TODO: move the content of this file to groupin-endpoints.spec.ts and delete this file.

describe("FEATURE: Grouping endpoints", () => {
  describe("RULE: Allow the user to group endpoints by the number of segments in the endpoint name", () => {
    it("Example: Grouping by ONE segment", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Alphacentauri.Proximacentauri.Endpoint1", "Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2"]));

      //Act
      await driver.goTo("monitoring");      
      await groupEndpointsBy({ numberOfSegments: 1 });

      expect(endpointsGroupsNames()).toEqual(["Universe"]);
      expect(endpointGroup("Universe").Endpoints).toEqual(["Alphacentauri.Proximacentauri.Endpoint1", "Solarsystem.Earth.Endpoint1", "Solarsystem.Earth.Endpoint2"]);
    });

    it("Example: Grouping by TWO segments", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Alphacentauri.Proximacentauri.Endpoint1", "Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2"]));

      //Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 2 });

      expect(endpointsGroupsNames()).toEqual(["Universe.Alphacentauri", "Universe.Solarsystem"]);
      expect(endpointGroup("Universe.Alphacentauri").Endpoints).toEqual(["Proximacentauri.Endpoint1"]);
      expect(endpointGroup("Universe.Solarsystem").Endpoints).toEqual(["Earth.Endpoint1", "Earth.Endpoint2"]);
    });
  });
});
