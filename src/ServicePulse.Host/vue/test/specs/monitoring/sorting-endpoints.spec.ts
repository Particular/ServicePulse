import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor, screen } from "@testing-library/vue";
import { enterFilterString } from "./actions/enterFilterString";
import { endpointWithName } from "./questions/endpointWithName";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";
import { endpointGroupNames } from "./questions/endpointGroupNames";
import { endpointGroup } from "./questions/endpointGroup";
import { filteredByName } from "./questions/filteredByName";
import { sortByColumn } from "./questions/endpointSortingColumnWithName";
import { sortEndpointsBy } from "./actions/sortEndpointsBy";
import { sortUpArrow, sortDownArrow } from "./questions/sortDirection";

import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint sorting", () => {
  describe("Rule: Grouped endpoints should be able to be sorted in ascending and descending order by group name and by endpoint name inside the group", () => {
    it("Example: Endpoint group names and the endpoints inside of the groups should be sorted in the same direction as the ungrouped endpoints", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
        ])
      );

      //Act
      await driver.goTo("monitoring");

      await groupEndpointsBy({ numberOfSegments: 3 });

      //Assert
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
    });

    it("Example: Endpoint group names and the endpoints inside of the groups should be sorted in descending order when clicking the endpoint name column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
        ])
      );

      //Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 3 });
      await sortEndpointsBy({ column: sortByColumn.ENDPOINTNAME });

      //Assert
      await waitFor(() => expect(sortDownArrow()).toBeInTheDocument());
      await waitFor(() => expect(sortUpArrow()).toBeNull());
      await waitFor(() => expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Venus", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Earth"]));
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint4", "Endpoint3"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint2", "Endpoint1"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint6", "Endpoint5"]);
    });

    it("Example: Endpoint group names and the endpoints inside of the groups should be sorted in ascending order when clicking twice on the endpoint name column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(
        precondition.monitoredEndpointsNamed([
          "Universe.Solarsystem.Venus.Endpoint3",
          "Universe.Solarsystem.Venus.Endpoint4",
          "Universe.Solarsystem.Mercury.Endpoint1",
          "Universe.Solarsystem.Mercury.Endpoint2",
          "Universe.Solarsystem.Earth.Endpoint5",
          "Universe.Solarsystem.Earth.Endpoint6",
        ])
      );

      //Act
      await driver.goTo("monitoring");
      await groupEndpointsBy({ numberOfSegments: 3 });
      await sortEndpointsBy({ column: sortByColumn.ENDPOINTNAME }); //Click the column title once for descending
      await sortEndpointsBy({ column: sortByColumn.ENDPOINTNAME }); //Click the column title again for ascending

      //Assert
      await waitFor(() => expect(sortDownArrow()).toBeNull());
      await waitFor(() => expect(sortUpArrow()).toBeInTheDocument());
      await waitFor(() => expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]));
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
    });
  });
});
