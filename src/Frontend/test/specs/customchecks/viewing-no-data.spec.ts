import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksMessage } from "./questions/customChecksMessage";
import { waitFor } from "@testing-library/vue";
// import NoData from "../../../src/components/NoData.vue";
// import { screen } from "@testing-library/vue";
// import { render } from "@component-test-utils";
describe("FEATURE: No data", () => {
  /* SCENARIO
          Given there are no custom checks
          When navigating to the custom checks tab
          Then a message is shown "No failed custom checks"
        */
  describe("RULE: When there is no data to show a message should be displayed ", () => {
    test("EXAMPLE: 'No failed custom checks' should be displayed when there are no custom checks", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.hasCustomChecksEmpty);
      //Act
      await driver.goTo("/custom-checks");
      //Expect
      //render(NoData, { props: { message: "No failed custom checks" } });
      //expect(await screen.findByText("No failed custom checks")).toBeVisible();
      // expect(await customChecksMessage()).toBe("No failed custom checks");
      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
  });
  /* SCENARIO
          Given there are custom checks
          And all custom checks are in a success state
          When navigating to the custom checks tab
          The a message is shown "No failed custom checks"
        */
  describe("RULE: When there is no data to show a message should be displayed ", () => {
    test("EXAMPLE: 'No failed custom checks' should be displayed when all custom checks are in a success state", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.hasCustomChecksPassing);
      //Act
      await driver.goTo("/custom-checks");
      //Expect
      //render(NoData, { props: { message: "No failed custom checks" } });
      // expect(await screen.findByText("No failed custom checks")).toBeVisible();
      //expect(await customChecksMessage()).toBe("No failed custom checks");
      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
  });
});
