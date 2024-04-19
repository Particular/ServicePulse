import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor, screen } from "@testing-library/vue";
import { groupEndpointsBy } from "./actions/groupEndpointsBy";
import { endpointGroupNames } from "./questions/endpointGroupNames";
import { endpointGroup } from "./questions/endpointGroup";
import { columnName } from "@/components/monitoring/EndpointListRow.vue";
import { sortEndpointsBy } from "./actions/sortEndpointsBy";
import { findSortImageInColumn } from "./questions/sortDirection";
import { smallGraphAverageValuesByColumn } from "./questions/smallGraphAverageValuesByColumn";
import { ungroupedEndpointNames } from "./questions/ungroupedEndpointNames";

import * as precondition from "../../preconditions";
import monitoredEndpointTemplate from "../../mocks/monitored-endpoint-template";
import { Endpoint } from "@/resources/MonitoringEndpoint";

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
      await assertSortImageState(columnName.ENDPOINTNAME, "up");
      for (const otherColumn of Object.values(columnName).filter((col) => col !== columnName.ENDPOINTNAME)) {
        await assertSortImageState(otherColumn, null); // Assert that all other columns don't have sorting images
      }
    });

    it("Example: Sort up and down arrow images should alternate visibility only on the column where the title was clicked", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      //Assert sorting of Endpoint name first since it sorts in ascending order by default, while all the the other columns sort in descending order by default
      await assertSortImageState(columnName.ENDPOINTNAME, "up");
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); // Act: Click the column title once for descending
      await assertSortImageState(columnName.ENDPOINTNAME, "down");

      //Assert for the rest of the columns
      for (const column of Object.values(columnName).filter((col) => col !== columnName.ENDPOINTNAME)) {
        await sortEndpointsBy({ column }); // Click the column title once for descending
        await assertSortImageState(column, "down");

        for (const otherColumn of Object.values(columnName).filter((col) => col !== column)) {
          await assertSortImageState(otherColumn, null); // Assert that all other columns don't have sorting images
        }

        await sortEndpointsBy({ column }); // Click the column title once for ascending
        await assertSortImageState(column, "up");

        for (const otherColumn of Object.values(columnName).filter((col) => col !== column)) {
          await assertSortImageState(otherColumn, null); // Assert that all other columns don't have sorting images
        }
      }
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on endpoint name", () => {
    it("Example: Endpoints are sorted in descending order by clicking name on the Endpoint name column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");

      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); // Act: Click the column title once for descending
      await assertSortImageState(columnName.ENDPOINTNAME, "down");

      //Assert
      for (const otherColumn of Object.values(columnName).filter((col) => col !== columnName.ENDPOINTNAME)) {
        await assertSortImageState(otherColumn, null); // Assert that all other columns don't have sorting images
      }
    });
    it("Example: Endpoints are sorted in ascending order by clicking name on the Endpoint name column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1", "Universe.Solarsystem.Earth.Endpoint2", "Universe.Solarsystem.Earth.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.ENDPOINTNAME }); // Act: Click the column title once for ascending
      await assertSortImageState(columnName.ENDPOINTNAME, "up");

      //Assert
      for (const otherColumn of Object.values(columnName).filter((col) => col !== columnName.ENDPOINTNAME)) {
        await assertSortImageState(otherColumn, null); // Assert that all other columns don't have sorting images
      }
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average queue length", () => {
    it("Example: Endpoints are sorted in descending order by clicking the queue length column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate)
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.queueLength.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate)
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.queueLength.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate)
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.queueLength.average = 1.1;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.QUEUELENGTH }); // Act: Click the column title once for descending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint2", "Endpoint1", "Endpoint3"]));
      const avgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.QUEUELENGTH }));
      await waitFor(() => expect(avgValues).toEqual(["4.1", "2.1", "1.1"]));
    });
    it("Example: Endpoints are sorted in ascending order by clicking the queue length column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.queueLength.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.queueLength.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.queueLength.average = 1.1;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.QUEUELENGTH }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.QUEUELENGTH }); // Act: Click the column title once for ascending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint3", "Endpoint1", "Endpoint2"]));
      const ascendingAvgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.QUEUELENGTH }));
      await waitFor(() => expect(ascendingAvgValues).toEqual(["1.1", "2.1", "4.1"]));
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average throughput per second", () => {
    it("Example: Endpoints are sorted in descending order by clicking the throughput column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.throughput.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.throughput.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.throughput.average = 1.1;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.THROUGHPUT }); // Act: Click the column title once for descending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint2", "Endpoint1", "Endpoint3"]));
      const avgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.THROUGHPUT }));
      await waitFor(() => expect(avgValues).toEqual(["4.1", "2.1", "1.1"]));
    });
    it("Example: Endpoints are sorted in ascending order by clicking the throughput column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.throughput.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.throughput.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.throughput.average = 1.1;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.THROUGHPUT }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.THROUGHPUT }); // Act: Click the column title once for ascending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint3", "Endpoint1", "Endpoint2"]));
      const ascendingAvgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.THROUGHPUT }));
      await waitFor(() => expect(ascendingAvgValues).toEqual(["1.1", "2.1", "4.1"]));
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average scheduled retries per second", () => {
    it("Example: Endpoints are sorted in descending order by clicking the scheduled retries column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.retries.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.retries.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.retries.average = 1.1;
      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1,endpoint2,endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.SCHEDULEDRETRIES }); // Act: Click the column title once for descending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint2", "Endpoint1", "Endpoint3"]));
      const avgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.SCHEDULEDRETRIES }));
      await waitFor(() => expect(avgValues).toEqual(["4.1", "2.1", "1.1"]));
    });
    it("Example: Endpoints are sorted in ascending order by clicking the scheduled retries column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.retries.average = 2.1;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.retries.average = 4.1;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.retries.average = 1.1;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.SCHEDULEDRETRIES }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.SCHEDULEDRETRIES }); // Act: Click the column title once for ascending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint3", "Endpoint1", "Endpoint2"]));
      const ascendingAvgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.SCHEDULEDRETRIES }));
      await waitFor(() => expect(ascendingAvgValues).toEqual(["1.1", "2.1", "4.1"]));
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average processing time", () => {
    it("Example: Endpoints are sorted in descending order by clicking the scheduled retries column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.processingTime.average = 350;
      
      const endpoint2  = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.processingTime.average = 800;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.processingTime.average = 225;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.PROCESSINGTIME }); // Act: Click the column title once for descending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint2", "Endpoint1", "Endpoint3"]));
      const avgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.PROCESSINGTIME }));
      await waitFor(() => expect(avgValues).toEqual(["800", "350", "225"]));
    });
    it("Example: Endpoints are sorted in ascending order by clicking the scheduled retries column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1: Endpoint = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.processingTime.average = 350;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.processingTime.average = 800;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.processingTime.average = 225;

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.PROCESSINGTIME }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.PROCESSINGTIME }); // Act: Click the column title once for ascending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint3", "Endpoint1", "Endpoint2"]));
      const ascendingAvgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.PROCESSINGTIME }));
      await waitFor(() => expect(ascendingAvgValues).toEqual(["225", "350", "800"]));
    });
  });

  describe("Rule: Ungrouped endpoints should be able to be sorted in ascending and descending order based on average critical time", () => {
    it("Example: Endpoints are sorted in descending order by clicking the scheduled retries column title", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      

      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.criticalTime.average = 350;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.criticalTime.average = 800;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.criticalTime.average = 225;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.CRITICALTIME }); // Act: Click the column title once for descending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint2", "Endpoint1", "Endpoint3"]));
      const avgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.CRITICALTIME }));
      await waitFor(() => expect(avgValues).toEqual(["800", "350", "225"]));
    });
    it("Example: Endpoints are sorted in ascending order by clicking the scheduled retries column title twice", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);      
      const endpoint1 = structuredClone(monitoredEndpointTemplate);
      endpoint1.name = "Endpoint1";
      endpoint1.metrics.criticalTime.average = 350;
      
      const endpoint2 = structuredClone(monitoredEndpointTemplate);
      endpoint2.name = "Endpoint2";
      endpoint2.metrics.criticalTime.average = 800;
      
      const endpoint3 = structuredClone(monitoredEndpointTemplate);
      endpoint3.name = "Endpoint3";
      endpoint3.metrics.criticalTime.average = 225;      

      await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1, endpoint2, endpoint3]));

      //Act
      await driver.goTo("monitoring");
      await sortEndpointsBy({ column: columnName.CRITICALTIME }); // Act: Click the column title once for descending
      await sortEndpointsBy({ column: columnName.CRITICALTIME }); // Act: Click the column title once for ascending

      //Assert
      await waitFor(() => expect(ungroupedEndpointNames().Endpoints).toEqual(["Endpoint3", "Endpoint1", "Endpoint2"]));
      const ascendingAvgValues = await waitFor(() => smallGraphAverageValuesByColumn({ column: columnName.CRITICALTIME }));
      await waitFor(() => expect(ascendingAvgValues).toEqual(["225", "350", "800"]));
    });
  });
});

async function assertSortImageState(column: string, direction: "up" | "down" | null) {
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
