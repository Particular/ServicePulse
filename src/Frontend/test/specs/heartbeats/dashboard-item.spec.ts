import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { expect } from "vitest";
import { queryHeartbeatDashboardItem } from "./questions/queryHeartbeatDashboardItem";

describe("FEATURE: Dashboard item", () => {
  describe("RULE: The count of unhealthy endpoints should be displayed", () => {
    test("EXAMPLE: Should not display the counter when there are zero unhealthy endpoints", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.goTo("dashboard");

      const heartbeatDashboardItem = await queryHeartbeatDashboardItem();
      expect(heartbeatDashboardItem && !heartbeatDashboardItem.isCounterVisible).toBeTruthy();
    });
  });
});
