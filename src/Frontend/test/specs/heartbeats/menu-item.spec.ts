import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Menu item", () => {
  describe("Rule: Show count of inactive endpoints", () => {
    it.todo("Not implemented");

    /* SCENARIO
      Given 5 monitored endpoint instances sending heartbeats
      When 1 of the endpoint instances stops sending heartbeats
      Then the menu item in the page header updates to include a badge indicating how many have stopped
    */

    /* SCENARIO
      Given a set of monitored endpoint instances
      When all instances are sending heartbeats
      Then the menu item in the page header does not include a badge
    */

    /* SCENARIO
      Given a set of monitored endpoint instances
      And 1 unmonitored endpoint instance
      When the unmonitored endpoint instance is not sending heartbeats
      Then the menu item badge is not displayed
    */
  });
});
