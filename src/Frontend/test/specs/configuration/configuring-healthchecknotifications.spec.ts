import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Health check notifications", () => {
  describe("Rule: Toggle email notifcations", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Enable email notifications
          
          Given Email notifications are OFF
          When the toggle button is clicked
          Then Email notifications are ON
        */

    /* SCENARIO
          Disable email notifications
          
          Given Email notifications are ON
          When the toggle button is clicked
          Then Email notifications are OFF
        */
  });
  describe("Rule: Configure email notifications", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Open email configuration
          
          Given the Email configuration popup is not visible
          When the "Configure" button is clicked
          Then the Email configuration popup is displayed
        */

    /* SCENARIO
          Invalid configurations cannot be saved
          
          Given the Email configuration popup is visible
          When invalid or incomplete data is entered into the form
          Then the Save button is not enabled
        */

    /* SCENARIO
          Email configuration changed can be cancelled
          
          Given the Email configuration popup is visible
          And edits have been made to the email configuration
          When the Cancel button is pressed
          Then the Email configuration popup is closed
          And no changes have been made to the email configuration
        */
  });
  describe("Rule: Health check notification configuration is persistent", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Email configuration
          
          When the email configuration has been changed
          And the screen is refreshed
          Then the email notification configuration matches what was last saved
        */

    /* SCENARIO
          Email notifications toggle
          
          Given the Email notifications are ON
          When the page is refreshed
          Then the Email notifications are ON
        */
  });
  describe("Rule: Send test notification", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Invalid Configuration
          
          Given an invalid configuration
          When "Send test notification" is clicked
          Then "TEST FAILED" is displayed
        */

    /* SCENARIO
          Valid Configuration
          
          Given a valid configuration
          When "Send test notification" is clicked
          Then "Test email sent successfully" is displayed
        */
  });
});
