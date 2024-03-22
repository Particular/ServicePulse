import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { numberOfGroupingSegments } from "./questions/numberOfGroupingSegments";
import { groupingOptionWithName } from "./questions/groupingOptionWithName";
import { openGroupingOptions } from "./actions/openGroupingOptions";
import { groupingOptions } from "./questions/groupingOptions";

describe("FEATURE: Grouping endpoints", () => {
  describe("RULE: The number of grouping segments is determined by the number of periods in the endpoint name ", () => {
    it("Example: All endpoints have two periods in their names", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["A.B.Endpoint1", "A.B.Endpoint2", "A.B.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();

      expect(await groupingOptionWithName(/max\. 1 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 2 segments/i)).toBeInTheDocument();
      expect(await numberOfGroupingSegments()).toBe(2);
    });

    it("Example: One endpoint has three periods in its name and the other endpoints have two periods in their name", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["A.B.C.Endpoint1", "A.B.Endpoint2", "A.B.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();

      expect(await groupingOptionWithName(/max\. 1 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 2 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 3 segments/i)).toBeInTheDocument();
      expect(await numberOfGroupingSegments()).toBe(3);
      //screen.logTestingPlaygroundURL();
    });

    it("Example: All endpoints have a different number of periods in their respective names", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["A.Endpoint1", "A.B.Endpoint2", "A.B.C.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();

      expect(await groupingOptionWithName(/max\. 1 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 2 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 3 segments/i)).toBeInTheDocument();
      expect(await numberOfGroupingSegments()).toBe(3);
      //screen.logTestingPlaygroundURL();
    });

    it("Example: One endpoint does not have a period in its name and the other endpoints have one period in their respective names", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1", "A.Endpoint2", "A.Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();

      expect(await groupingOptionWithName(/max\. 1 segments/i)).toBeInTheDocument();
      expect(await numberOfGroupingSegments()).toBe(1);
      //screen.logTestingPlaygroundURL();
    });

    it("Example: No endpoints have a period in their respective names", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1", "Endpoint2", "Endpoint3"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();
      //screen.logTestingPlaygroundURL();
      expect(await groupingOptionWithName(/no grouping/i)).toBeInTheDocument();
      expect(groupingOptions().length).toBe(1);
      //screen.logTestingPlaygroundURL();
    });
  });
});
