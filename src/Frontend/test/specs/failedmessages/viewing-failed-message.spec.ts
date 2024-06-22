import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Message View", () => {
  describe("Rule: Error scenarios should be handled gracefully", () => {
    it.todo("Example: When no data is returned for a message, text should be shown indicating that the message could not be found");

    /* SCENARIO
        Given no data is returned from ServiceControl for a message id
        When the message view is shown
        Then a text will be shown indicating that the message could not be found
      */

    it.todo("Example: When an error is returned for a message, text should be shown indicating that an error occurred");
    /* SCENARIO
        Given an error is returned from ServiceControl for a message id
        When the message view is shown
        Then a text will be shown indicating that an error occured and to investigate ServiceControl logs for the reason
      */
  });
  describe("Rule: Header should show meta information and action buttons for a message that has not been deleted", () => {
    it.todo("Example: Message name should be displayed as a heading");
    it.todo("Example: Time period indicating how long ago the failure happened should be displayed");
    it.todo("Example: Name of the Endpoint that the message failed on should be displayed");
    it.todo("Example: Name of the Machine that the message failed on should be displayed");
    it.todo("Example: Delete message button should be displayed");
    it.todo("Example: Retry message button should be displayed");
    it.todo("Example: View in ServiceInsight button should be displayed");
    it.todo("Example: Export message button should be displayed");

    /* SCENARIO
        Given the message is not deleted
        When the message view is shown
        Then the view header will display the message name as a heading
        and the header will display a time period indicating how long ago the failure happened (retry failure if there is one)
        and the header will display the name of the Endpoint that the message failed on
        and the header will display the name of the Machine that the message failed on
        and the header will display a "Delete message" button
        and the header will display buttons for "Retry message", "View in ServiceInsight" and "Export Message"
      */
  });
  describe("Rule: Header should show meta information and action buttons for a message that has been deleted", () => {
    it.todo("Example: Message name should be displayed as a heading");
    it.todo("Example: Header should display prominently that the message is deleted");
    it.todo("Example: Time period indicating how long ago the failure happened should be displayed");
    it.todo("Example: Name of the Endpoint that the message failed on should be displayed");
    it.todo("Example: Name of the Machine that the message failed on should be displayed");
    it.todo("Example: Time period indicating how long ago the message was deleted should be displayed");
    it.todo("Example: Time period indicating when the messages is schedule for hard deletion should be displayed prominently");
    it.todo("Example: Restore button should be displayed");
    it.todo("Example: View in ServiceInsight button should be displayed");

    /* SCENARIO
        Given the message is deleted
        When the message view is shown
        Then the view header will display the message name as a heading
        and the header will display prominently that the message is deleted
        and the header will display a time period indicating how long ago the failure happened (retry failure if there is one)
        and the header will display the name of the Endpoint that the message failed on
        and the header will display the name of the Machine that the message failed on
        and the header will display a time period indicating how long ago the messsage was deleted
        and the header will display, in a prominent style, a time period indicating when the messages is schedule for hard deletion
        and the header will display a "Restore" button
        and the header will display buttons for "View in ServiceInsight" and "Export Message"
      */

    /* QUESTIONS
        this view also displays the "Retry message" button, but it's always disabled. Should the button be hidden instead?
      */
  });
});
