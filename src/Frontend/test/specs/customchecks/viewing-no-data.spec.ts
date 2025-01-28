import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { customChecksMessage } from "./questions/customChecksMessage";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: No data", () => {
  describe("RULE: When there is no data to show, a message should be displayed ", () => {
    test("EXAMPLE: There are no failed or passing custom checks", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecksEmpty);

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
    test("EXAMPLE: There are custom checks but none of them are failing", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasCustomChecksPassing);

      await driver.goTo("/custom-checks");

      await waitFor(async () => {
        expect(await customChecksMessage()).toBe("No failed custom checks");
      });
    });
  });
});
