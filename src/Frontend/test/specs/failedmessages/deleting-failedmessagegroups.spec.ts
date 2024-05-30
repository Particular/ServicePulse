import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Deleted Message Groups", () => {
  describe("Rule: Deleted Message Groups view shows all current deleted messages, grouped by the selected grouping", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are no Deleted Messages 
          Then the "Deleted Message Groups" tab will display a message indicating the fact
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Deleted Message Groups" tab
          Then the group row will display the current grouping name in bold
          and the group will display the number of messages in the group
          and the group will display a time period indicating how long ago the first failure happened
          and the group will display a time period indicating how long ago the last failure happened
          and the group will display a time period indicating how long ago the group was last retried, or N/A if never retried
        */
  });
  describe("Rule: actions", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are 1 or more groups shown on the "Deleted Message Groups" tab
          Then "Restore group" is shown as an available action on the group
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Deleted Message Groups" tab
          When the user clicks the "Restore group" action
          and clicks "Yes" on the action confirmation modal
          Then all the messages in the selected group are returned to the Failed Messages list
          and the list refreshes with progress/confirmation of the successful restoration
        */
  });
  describe("Rule: Ability to select a given group should be hinted ", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Mouse hovering a group
          
          Given there are 1 or more groups show in the "Deleted Message Groups" tab
          and the user hovers over a Deleted Message Group row
          Then the row indicates that it is active (hover state)
          and that it is selectable (cursor/underlining)
        */
  });
});
