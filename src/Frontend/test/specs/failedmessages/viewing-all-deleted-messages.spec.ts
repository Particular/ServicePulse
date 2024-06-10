import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: All Deleted Messages", () => {
  describe("Rule: All deleted messages view should show an unfiltered list", () => {
    it.todo("Example: All deleted messages tab should be highlighted as active");
    it.todo("Example: Browser tab title should show 'All Deleted Messages'");

    /* SCENARIO
          Given the entry route to the deleted messages view is from the "All Deleted Messages" tab
          Then the view should show all current deleted messages 
          and the "All Deleted Messages" tab should be highlighted as active
          and the browser tab title should show "All Deleted Messages"
        */

    it.todo("Example: Deleted messages should be ordered according to the selected sort by field");
    /* SCENARIO
          Given the deleted messages are shown
          Then they are ordered according to the selected Sort By field
        */

    it.todo("Example: A deleted message should display the current message name in bold");
    it.todo("Example: A deleted message should display a time period indicating how long ago the failure happened");
    it.todo("Example: A deleted message should display the name of the Endpoint that the message failed on");
    it.todo("Example: A deleted message should display the name of the Machine that the message failed on");
    it.todo("Example: A deleted message should display a time period indicating how long ago it was deleted");
    it.todo("Example: A deleted message should display, in a prominent style, a time period indicating when the message is scheduled for hard deletion");

    /* SCENARIO
          Given there are 1 or more Deleted Message rows shown
          Then the row will display the current message name in bold
          and the row will display a time period indicating how long ago the failure happened (retry failure if there is one)
          and the row will display the name of the Endpoint that the message failed on
          and the row will display the name of the Machine that the message failed on
          and the row will display a time period indicating how long ago it was deleted
          and the row will display, in a prominent style, a time period indicating when the message is scheduled for hard deletion
          and the row will display the exception message text
        */

    it.todo("Example: A deleted message should display the number of times it has failed retries");
    /* SCENARIO
          Given there is a Deleted Message row shown
          and that row has previously been retried
          Then the row will display the number of times it has failed retries (note: 1 less than total failures for the message)
          and this retry failure information will be visually more prominent than the other information
        */

    it.todo("Example: A message should be shown when there are no deleted messages");
    /* SCENARIO
          Given there are no Deleted Messages 
          Then the "All Deleted Message" tab will display a message indicating the fact
        */
  });
  describe("Rule: Deleted messages (group route) view should only show deleted messages associated with that group", () => {
    it.todo("Example: Only messages of a selected group should be shown");
    it.todo("Example: Group name should be shown as a heading");
    it.todo("Example: Group message count should be shown as a subtext to the group heading");
    it.todo("Example: Deleted Message Groups tab should remain highlighted as active");

    /* SCENARIO
          Given the entry route to the deleted messages view is from selecting a group in the "Deleted Message Groups" tab
          Then the view should show only deleted messages associated with the selected group 
          and the group name should be shown as a heading 
          and the group message count should be shown as a subtext to the group heading
          and the "Deleted Message Groups" tab should remain highlighted as active
        */
  });
  describe("Rule: Row hover functionality", () => {
    it.todo("Example: Hovering the cursor over a deleted message should indicate that it is active and selectable");

    /* SCENARIO
          Given there are 1 or more Deleted Message rows shown
          and the user hovers over a Deleted Message row
          Then the row indicates that it is active (hover state)
          and that it is selectable (cursor/underlining)
        */
  });
  describe("Rule: button functionality", () => {
    it.todo("Example: Selecting a row should enable the 'Restore Selected' button");

    /* SCENARIO
          Given no Deleted Message rows are selected
          Then the "Select All" button is enabled
          and the "Restore Selected" button is disabled
        */

    it.todo("Example: Selecting all rows should enable the 'Restore Selected' button");
    /* SCENARIO
          Given 1 or more Deleted Message rows are selected
          Then the "Select All" button is replaced by a "Clear Selection" button
          and the "Restore selected" button indicates the number of rows selected and is enabled
        */

    it.todo("Example: Clicking the 'Restore Selected' button should show an action confirmation modal");
    it.todo("Example: Clicking 'Yes' on the action confirmation modal should restore the message");
    it.todo("Example: The list should refresh with the restored message removed");
    /* SCENARIO
          Given 1 or more Deleted Message rows are selected
          When the user clicks the "Restore selected" button
          and clicks "Yes" on the action confirmation modal
          Then the message is restored
          and the list refreshes with the restored message removed
        */

    /* QUESTIONS
          note that there is a progress-update intermediate step between deleted and restored states which will briefly show on screen depending on the update polling rate
        */
  });
});