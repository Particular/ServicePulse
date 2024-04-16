import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor, screen } from "@testing-library/vue";
import { endpointWithName } from "./questions/endpointWithName";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";
import { endpointGroupNames } from "./questions/endpointGroupNames";
import { endpointGroup } from "./questions/endpointGroup";
import { columnName } from "@/components/monitoring/EndpointListRow.vue";
import { sortEndpointsBy } from "./actions/sortEndpointsBy";
import { findSortImageInColumn } from "./questions/sortDirection";

import * as precondition from "../../preconditions";

describe("FEATURE: Endpoint sorting", () => {
  describe("Rule: Grouped endpoints should be able to be sorted in ascending and descending order by group name and by endpoint name inside the group", () => {
    it("Example: Endpoints inside of the groups and group names should be sorted in the same direction as the ungrouped endpoints", async ({ driver }) => {
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

      //Act
      await groupEndpointsBy({ numberOfSegments: 0 });
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); //Descending
      await groupEndpointsBy({ numberOfSegments: 3 });
      //Assert
      expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Venus", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Earth"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint4", "Endpoint3"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint2", "Endpoint1"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint6", "Endpoint5"]);
    });

    it("Example: Endpoints inside of the groups and group names should be sorted in descending order when clicking the endpoint name column title", async ({ driver }) => {
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
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME });

      //Assert
      await waitFor(() => expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Venus", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Earth"]));
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint4", "Endpoint3"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint2", "Endpoint1"]);
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint6", "Endpoint5"]);
    });

    it("Example: Endpoints inside of the groups and group names should be sorted in ascending order when clicking twice on the endpoint name column title", async ({ driver }) => {
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
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); //Click the column title once for descending
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); //Click the column title again for ascending

      //Assert
      await waitFor(() => expect(endpointGroupNames()).toEqual(["Universe.Solarsystem.Earth", "Universe.Solarsystem.Mercury", "Universe.Solarsystem.Venus"]));
      expect(endpointGroup("Universe.Solarsystem.Earth").Endpoints).toEqual(["Endpoint5", "Endpoint6"]);
      expect(endpointGroup("Universe.Solarsystem.Mercury").Endpoints).toEqual(["Endpoint1", "Endpoint2"]);
      expect(endpointGroup("Universe.Solarsystem.Venus").Endpoints).toEqual(["Endpoint3", "Endpoint4"]);
    });
  });

  describe("Rule: Sort arrow images should only be visible on the column that is being sorted", () => {
    it("Example: Sort up arrow should only be visible on endpoint name column on page load", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //Assert
      await waitFor(() => expect(findSortImageInColumn(columnName.ENDPOINTNAME, "up")).toBeInTheDocument());
      await waitFor(() => expect(findSortImageInColumn(columnName.ENDPOINTNAME, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.CRITICALTIME, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.CRITICALTIME, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.PROCESSINGTIME, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.PROCESSINGTIME, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.QUEUELENGTH, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.QUEUELENGTH, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.QUEUELENGTH, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.QUEUELENGTH, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.SCHEDULEDRETRIES, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.SCHEDULEDRETRIES, "down")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.THROUGHPUT, "up")).toBeNull());
      await waitFor(() => expect(findSortImageInColumn(columnName.THROUGHPUT, "down")).toBeNull());
    });
    it("Example: Sort up and sort down arrow images should alternate when the column name is clicked and should only be visible on the column endpoint name column on click", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //Assert sorting of Endpoint name first since it sorts in ascending order by default and all the the other columns sort by descending
      await assertSortState(columnName.ENDPOINTNAME, "up");
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); // Click the column title once for descending
      await assertSortState(columnName.ENDPOINTNAME, "down");

      //Assert for the rest of the columns
      for (const column of Object.values(columnName).filter((col) => col !== columnName.ENDPOINTNAME)) {
        await sortEndpointsBy({ column }); // Click the column title once for descending
        await assertSortState(column, "down");

        for (const otherColumn of Object.values(columnName).filter((col) => col !== column)) {
          await assertSortState(otherColumn, null); // Assert that all other columns don't have sorting images
        }

        await sortEndpointsBy({ column }); // Click the column title once for ascending
        await assertSortState(column, "up");

        for (const otherColumn of Object.values(columnName).filter((col) => col !== column)) {
          await assertSortState(otherColumn, null); // Assert that all other columns don't have sorting images
        }
      }
    });
  });
  describe.skip("Rule: Sort arrow images should indicate the direction that the endpoints are being sorted", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on endpoint name", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average queue length", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average throughput", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average scheduled retries", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average processing time", () => {});
  describe.skip("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average critical time", () => {});
});

async function assertSortState(column: string, direction: "up" | "down" | null) {
  if (direction === null) {
    await waitFor(() => expect(findSortImageInColumn(column, "up")).toBeNull());
    await waitFor(() => expect(findSortImageInColumn(column, "down")).toBeNull());
  } else if (direction === "up") {
    await waitFor(() => expect(findSortImageInColumn(column, "up")).toBeInTheDocument());
    await waitFor(() => expect(findSortImageInColumn(column, "down")).toBeNull());
  } else {
    await waitFor(() => expect(findSortImageInColumn(column, "up")).toBeNull());
    await waitFor(() => expect(findSortImageInColumn(column, "down")).toBeInTheDocument());
  }
}
