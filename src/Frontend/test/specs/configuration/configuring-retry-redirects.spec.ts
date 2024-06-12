import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Retry redirects", () => {
  describe("Rule: Existing connection details should be shown", () => {
    it.todo("Example: The set ServiceControl connection URL should be displayed");

    /* SCENARIO
          ServiceControl connection

          Given a ServiceControl connection of http://localhost:33333/api/
          When the page loads
          Then the ServiceControl connection url box should show http://localhost:33333/api
        */
    it.todo("Example: The set ServiceControl Monitoring connection URL should be displayed");
    /* SCENARIO
          ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection of http://localhost:33633/
          When the page loads
          Then the ServiceControl Monitoring connection url box should show http://localhost:33633/
        */
  });
  describe("Rule: Connection details should be able to be tested", () => {
    it.todo("Example: Clicking the ServiceControl 'Test' button with a valid URL should display a success message");

    /* SCENARIO
          Valid ServiceControl connection

          Given a ServiceControl connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    it.todo("Example: Clicking the ServiceControl 'Test' button with an invalid URL should display a failure message");
    it.todo("Example: Clicking the ServiceControl 'Test' button with a URL to an instance that isn't running should display a failure message");
    /* SCENARIO
          Invalid ServiceControl connection

          Given a ServiceControl connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */

    it.todo("Example: Clicking the ServiceControl Monitoring 'Test' button with a valid URL should display a success message");

    /* SCENARIO
          Valid ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    it.todo("Example: Clicking the ServiceControl Monitoring 'Test' button with an invalid URL should display a failure message");
    it.todo("Example: Clicking the ServiceControl Monitoring 'Test' button with a URL to an instance that isn't running should display a failure message");
    /* SCENARIO
          Invalid ServiceControl Monitoring connection

          Given a ServiceControl Monitoring connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */
  });
  describe("Rule: Connection URLs should be able to be saved", () => {
    it.todo("Example: Clicking the 'Save' button with a valid running instance should display a success message");

    /* SCENARIO
          Valid ServiceControl connection

          Given a ServiceControl connection to a valid running instance
          When the Save button is clicked
          Then "Connection saved" should be displayed
        */

    it.todo("Example: Updating a connection URL and refreshing the page should display the original value");
    /* SCENARIO
          Not saved

          Given a ServiceControl connection
          When the ServiceControl connection is changed
          And the page is refreshed
          Then the original value is restored
        */
  });
  describe("Rule: The ServiceControl Monitoring URL should be optional", () => {
    it.todo("Example: Entering a '!' into the Monitoring connection URL should disable the Test button and remove the Monitoring tab");

    /* SCENARIO
          When the Monitoring connection is set to !
          Then the Test button is disabled
          And the Monitoring tab is removed
        */
  });
});
