import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: All Failed Messages", () => {
  describe("Rule: All failed messages view should show an unfiltered list", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given the entry route to the failed messages view is from the "All Failed Messages" tab
          Then the view should show all current failed messages 
          and the "All Failed Messages" tab should be highlighted as active
          and the browser tab title should show "All Failed Messages"
        */

    /* SCENARIO
          Given the failed messages are shown
          Then they are ordered according to the selected Sort By field
        */

    /* SCENARIO
          Given there are 1 or more Failed Message rows shown
          Then the row will display the current message name in bold
          and the row will display a time period indicating how long ago the failure happened (retry failure if there is one)
          and the row will display the name of the Endpoint that the message failed on
          and the row will display the name of the Machine that the message failed on
          and the row will display the exception message text
        */

    /* SCENARIO
          Given there is a Failed Message row shown
          and that row has previously been retried
          Then the row will display the number of times it has failed retries (note: 1 less than total failures for the message)
          and this retry failure information will be visually more prominent than the other information
        */

    /* SCENARIO
          Given there are no Failed Messages 
          Then the "All Failed Message" tab will display a message indicating the fact
        */
  });
  describe("Rule: Failed messages (group route) view should only show failed messages associated with that group", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given the entry route to the failed messages view is from selecting a group in the "Failed Message Groups" tab
          Then the view should show only failed messages associated with the selected group 
          and the group name should be shown as a heading 
          and the group message count should be shown as a subtext to the group heading
          and the "Failed Message Groups" tab should remain highlighted as active
        */
  });
  describe("Rule: Row hover functionality", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are 1 or more Failed Message rows shown
          and the user hovers over a Failed Message row
          Then the row indicates that it is active (hover state)
          and that it is selectable (cursor/underlining)
          and the "Request Retry" action is made available on the row
        */

    /* QUESTIONS
          why is "Request Retry" not always shown, similar to "Request Retry" on the Failed Message Groups screen?
        */
  });
  describe('Rule: The badge counter on the "All Failed Messages" tab header and the "Failed messages" main navigation items should reflect the total count of failed messages', () => {
    it.todo("Not implemented");
  });
  describe("Rule: action functionality", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given there are 1 or more Failed Message rows are shown
          and the user clicks the "Request Retry" action for a row
          Then the row indicates that it is pending a retry
          and the row is removed from the "Failed Messages" list once the retry has been initiated
        */
  });
  describe("Rule: button functionality", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given no Failed Message rows are selected
          Then the "Select All" button is enabled
          and the "Retry Selected" button is disabled
          and the "Delete Selected" button is disabled
          and the "Export Selected" button is disabled
        */

    /* SCENARIO
          Given 1 or more Failed Message rows are selected
          Then the "Select All" button is replaced by a "Clear Selection" button
          and the "Retry selected" button indicates the number of rows selected and is enabled
          and the "Delete selected" button indicates the number of rows selected and is enabled
          and the "Export selected" button indicates the number of rows selected and is enabled
        */

    /* SCENARIO
          Given 1 or more Failed Message rows are selected
          When the "Export selected" button is clicked
          Then an export is generated containing garbled results due to commas in the exception details field
          and the end-user finds this functionality completely useless
        */
  });
});
