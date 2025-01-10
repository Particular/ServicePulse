import { expect, vi } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { queryHeartbeatMenuItem } from "./questions/queryHeartbeatMenuItem";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: Menu item", () => {
  describe("RULE: The count of inactive endpoints should be displayed in the navigation menu", () => {
    test("EXAMPLE: One unhealthy endpoint", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAnUnhealthyEndpoint());

      await driver.goTo("dashboard");

      await waitFor(async () => {
        const heartbeatMenuItem = await queryHeartbeatMenuItem();

        expect(heartbeatMenuItem && heartbeatMenuItem.isCounterVisible).toBeTruthy();
        expect(heartbeatMenuItem && heartbeatMenuItem.counterValue).toBe(1);
      });
    });

    /* SCENARIO
      Given 5 monitored endpoint instances sending heartbeats
      When 1 of the endpoint instances stops sending heartbeats
      Then the menu item in the page header updates to include a badge indicating how many have stopped
    */

    test("EXAMPLE: An instance starts sending heartbeats, the menu item should remove the badge", async ({ driver }) => {
      vi.useFakeTimers();
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAnUnhealthyEndpointWithNamePrefix("ResurrectingEndpoint"));

      await driver.goTo("dashboard");

      vi.advanceTimersByTime(5000);

      await waitFor(async () => {
        const heartbeatMenuItem = await queryHeartbeatMenuItem();

        expect(heartbeatMenuItem && heartbeatMenuItem.isCounterVisible).toBeTruthy();
        expect(heartbeatMenuItem && heartbeatMenuItem.counterValue).toBe(1);
      });

      await driver.setUp(precondition.hasAHealthyEndpointWithNamePrefix("ResurrectingEndpoint"));
      vi.advanceTimersByTime(5000);

      await waitFor(async () => {
        const heartbeatMenuItem = await queryHeartbeatMenuItem();

        expect(heartbeatMenuItem && !heartbeatMenuItem.isCounterVisible).toBeTruthy();
        expect(heartbeatMenuItem && heartbeatMenuItem.counterValue).toBe(0);
      });

      vi.restoreAllMocks();
    });
    /* SCENARIO
      Given a set of monitored endpoint instances
      When all instances are sending heartbeats
      Then the menu item in the page header does not include a badge
    */

    test.todo("EXAMPLE: An unmonitored instance stops sending heartbeats, the menu item should not show a badge with a count");

    /* SCENARIO
      Given a set of monitored endpoint instances
      And 1 unmonitored endpoint instance
      When the unmonitored endpoint instance is not sending heartbeats
      Then the menu item badge is not displayed
    */
  });
});
