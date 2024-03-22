import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import numberOfGroupingOptions from "./questions/numberOfGroupingOptions";
import groupingOptionWithName from "./questions/textOfGroupingOptionIs";
import openGroupingOptions from "./actions/openGroupingOptions";

describe("FEATURE: Grouping endpoints", () => {
  describe("RULE: The number of grouping segments is determined by the number of periods in the endpoint name ", () => {
    it("Example: All enpoints have two periods in their names", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1.A.B", "Endpoint2.A.B", "Endpoint3.A.B"]));

      //Act
      await driver.goTo("monitoring");
      await openGroupingOptions();
      
      expect(await groupingOptionWithName(/max\. 1 segments/i)).toBeInTheDocument();
      expect(await groupingOptionWithName(/max\. 2 segments/i)).toBeInTheDocument();
      expect(await numberOfGroupingOptions()).toBe(2);
    });
  });
});
