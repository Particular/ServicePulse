import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Dismiss custom checks", () => {
  describe("Rule: Dismiss button should be visible", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given 2 failing custom checks
          And the custom checks page is open
          Then each should render a dismiss button
        */
  });
  describe("Rule: Clicking dismiss should remove from the list", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given 2 failing custom checks
          When the dismiss button is clicked
          Then the dismissed custom check should be removed from the list
        */
  });
  describe("Rule: Failing after a dismiss should cause the failed check to reappear", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given 2 failed custom checks
          And one of them is dismissed
          When the dismissed custom check fails
          Then the custom check should appear in the list
        */
  });
});
