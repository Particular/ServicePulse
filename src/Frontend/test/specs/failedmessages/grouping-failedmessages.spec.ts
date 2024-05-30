import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Failed Message Groups", () => {
  describe("Rule: Failed Message Groups view shows all current failed messages, grouped by the selected grouping and sorted by the selected sort", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are no Failed Messages 
          Then the "Failed Message Groups" tab will display a message indicating the fact
        */
  });
  describe("Rule: Overview information of each of each group should be displayed without having to navigate to the Failed Message Group details", () => {
    it.todo("Not implemented");

    /* SCENARIO
          A group wtih failures that occurred in different times that has also been retried
          
          Given the following groups of failed messages
          |name         | number of failures | first failed time | last failure time | Las retried time|  
          |MessageX | 50                            | 13:00              | 13:51                       |   14:05                |  
          And the current time is 15:00
          When the list of failed messages groups is loaded
          Then a row with the following information is included in the list
          TODO: insert table with expected data to be visualized
          
          Previous more generic scenario draft:
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          Then the group row will display the current grouping name in bold
          and the group will display the number of messages in the group
          and the group will display a time period indicating how long ago the first failure happened
          and the group will display a time period indicating how long ago the last failure happened
          and the group will display a time period indicating how long ago the group was last retried, or N/A if never retried
        */
  });
  describe("Rule: Ability to select a given group should be hinted ", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Mouse hovering a group
          
          Given there are 1 or more groups show in the "Failed Message Groups" tab
          and the user hovers over a Failed Message Group row
          Then the row indicates that it is active (hover state)
          and that it is selectable (cursor/underlining)
        */
  });
  describe("Rule: Routing should place routes in browser history", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Navigating back after selecting a group
          
          Given I start from the "Failed Message Groups" view
          and I select a group to view
          and the "Failed Messages" view is shown
          When I navigate back in the browser
          Then I should be returned to the "Failed Message Groups" view
          (and subsequently navigating forwards should return me to the same "Failed Messages" view)
        */

    /* SCENARIO
          Navigating between tabs of "Failed Messages" area
          
          Given I am in the "Failed Messages" area
          and I click between tabs
          Then the browser navigation forward/backward should navigate me through the selected tabs, in order
        */
  });
  describe("Rule: Selected Grouping and Sort Order should remain selected when returning to Failed Message Groups tab", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given I have selected a particular grouping and sorting on the "Failed Message Groups" tab
          and I have navigated away from the tab, or I have refreshed the application, or I have closed the application and re-opened it
          When I return to the "Failed Message Groups" tab
          Then the grouping and sorting that I have previously selected are restored
        */
  });
  describe("Rule: Something to do with last 10 completed retry requests", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Something to do with the badge on the tab header", () => {
    it.todo("Not implemented");

    /* SCENARIO
          being queried with TF
        */
  });
  describe("Rule: Actions on groups are conditional on the state of the group", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          Then "Request Retry" is shown as an available action on the group
          and "Delete group" is shown as an available action on the group
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          and no note has been added to the group
          Then "Add Note" is shown as an available action on the group
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          and a note has been added to the group
          Then the note contents are shown on the group row
          and "Edit Note" is shown as an available action on the group
          and "Remove Note" is shown as an available action on the group
        */

    /* SCENARIO
          Given there is a group shown on the "Failed Message Groups" tab
          and a note has been added to the group
          When the user clicks the "Remove Note" action
          and clicks "Yes" on the action confirmation modal
          Then the note is removed from the group
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          When the user clicks the "Request Retry" action
          and clicks "Yes" on the action confirmation modal
          Then all the messages in the selected group are scheduled for retry
          and the list refreshes with the retried group removed
        */

    /* SCENARIO
          Given there are 1 or more groups shown on the "Failed Message Groups" tab
          When the user clicks the "Delete Group" action
          and clicks "Yes" on the action confirmation modal
          Then all the messages in the selected group are deleted according to the ServiceControl retention policy
          and the list refreshes with progress/confirmation of the successful deletion
        */
  });
});
