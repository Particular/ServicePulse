import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Message View", () => {
  describe("Rule: Error scenarios", () => {
    it.todo("Not implemented");

    /* SCENARIO
        Given no data is returned from ServiceControl for a message id
        When the message view is shown
        Then a text will be shown indicating that the message could not be found
      */

    /* SCENARIO
        Given an error is returned from ServiceControl for a message id
        When the message view is shown
        Then a text will be shown indicating that an error occured and to investigate ServiceControl logs for the reason
      */
  });
  describe("Rule: Header shows meta information and action buttons", () => {
    it.todo("Not implemented");

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
  describe("Rule: buttons", () => {
    it.todo("Not implemented");
  });
});
