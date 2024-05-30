import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Retry redirects", () => {
  describe("Rule: Existing connection details are shown", () => {
    it.todo("Not implemented");

    /* SCENARIO
          ServiceControl connection
          
          Given a ServiceControl connection of http://localhost:33333/api/
          When the page loads
          Then the ServiceControl connection url box should show http://localhost:33333/api
        */

    /* SCENARIO
          ServiceControl Monitoring connection
          
          Given a ServiceControl Monitoring connection of http://localhost:33633/
          When the page loads
          Then the ServiceControl Monitoring connection url box should show http://localhost:33633/api
        */
  });
  describe("Rule: Connection details can be tested", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Valid ServiceControl connection
          
          Given a ServiceControl connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    /* SCENARIO
          Invalid ServiceControl connection
          
          Given a ServiceControl connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */

    /* SCENARIO
          Valid ServiceControl Monitoring connection
          
          Given a ServiceControl Monitoring connection to a valid running instance
          When the Test button is clicked
          Then "Connection successful" should be displayed
        */

    /* SCENARIO
          Invalid ServiceControl Monitoring connection
          
          Given a ServiceControl Monitoring connection to an invalid or not running instance
          When the Test button is clicked
          Then "Connection failed" should be displayed
        */
  });
  describe("Rule: Connection can be saved", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Valid ServiceControl connection
          
          Given a ServiceControl connection to a valid running instance
          When the Save button is clicked
          Then "Connection saved" should be displayed
        */

    /* SCENARIO
          Not saved
          
          Given a ServiceControl connection
          When the ServiceControl connection is changed
          And the page is refreshed
          Then the original value is restored
        */
  });
  describe("Rule: Monitoring can be disabled", () => {
    it.todo("Not implemented");

    /* SCENARIO
          When the Monitoring connection is set to !
          Then the Test button is disabled
          And the Monitoring tab is removed
        */
  });
});
