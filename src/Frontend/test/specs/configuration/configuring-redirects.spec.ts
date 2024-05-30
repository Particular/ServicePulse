import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Redirects", () => {
  describe("Rule: List redirects", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Empty
          
          When there are no redirects
          Then "There are currently no redirects" should appear
        */

    /* SCENARIO
          Non-empty
          
          When there are redirects
          Then they are shown
        */

    /* NOTES
          From Address
          To Address
          Last Modified
          End Redirect
          Modify Redirect
        */
  });
  describe("Rule: Create redirect", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Valid redirect
          
          When Create Redirect is clicked
          And valid redirect info is entered
          And Save is clicked
          Then the redirect is created
        */

    /* SCENARIO
          Cannot save invalid
          
          When Create Redirect is clicked
          And invalid redirect info is entered
          Then the Save button is disabled
        */

    /* SCENARIO
          Warn if to-address is not known
          
          When Create Redirect is clicked
          And valid redirect info is entered
          And the to address is not known to ServiceControl
          Then a warning message is shown
          And the redirect can still be created
        */

    /* SCENARIO
          Immediate retry
          
          When Create Redirect is clicked
          And valid redirect info is entered
          And the "Immediately retry any matching failed messages" checkbox is checked
          And the Create button is clicked
          Then the redirect is created
          And a retry operation starts matching the from physical address
        */

    /* SCENARIO
          No immediate retry
          
          When Create Redirect is clicked
          And valid redirect info is entered
          And the "Immediately retry any matching failed messages" checkbox is unchecked
          And the Create button is clicked
          Then the redirect is created
          And no retry operation starts
        */

    /* SCENARIO
          Cannot create multiple redirects for same from address
          
          Given a redirect exists with a From address of "Endpoint1"
          When a new redirect is created with a From address of "Endpoint1"
          Then no new redirect is created
          And the user is notified that this action is invalid
        */

    /* SCENARIO
          Cannot chain redirects
          
          Given a rediect exists with a From address of "Endpoint1"
          When a new redirect is created with a To address of "Endpoint1"
          Then no new redirect is created
          And the user is notified that this action is invalid
        */

    /* SCENARIO
          Cannot chain redirects 2
          
          Given a rediect exists with a To address of "Endpoint1"
          When a new redirect is created with a From address of "Endpoint1"
          Then no new redirect is created
          And the user is notified that this action is invalid
        */

    /* SCENARIO
          Cancel
          
          When Create Redirect is clicked
          And valid redirect info is entered
          And Cancel is clicked
          Then the Create redirect dialog is closed
          And no redirect is created
        */
  });
  describe("Rule: Modify redirect", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Cannot change from address
          
          Given an existing redirect
          When Modify Redirect is clicked
          Then the Modify redirect dialog is shown
          And the From address cannot be changed
        */

    /* SCENARIO
          Can change to address
          
          Given an existing redirect
          When Modify Redirect is clicked
          And the To address is changed
          And the Modify button is clicked
          Then the redirect is updated
        */

    /* SCENARIO
          Warn if to-address is not known
          
          Given an existing redirect
          When Modify Redirect is clicked
          And the to address is not known to ServiceControl
          Then a warning message is shown
          And the redirect can still be modified
        */

    /* SCENARIO
          Cannot chain redirects
          
          Given a rediect exists with a From address of "Endpoint1"
          When another redirect is modfied with a To address of "Endpoint1"
          Then the redirect is not modified
          And the user is notified that this action is invalid
        */

    /* SCENARIO
          Cannot chain redirects 2
          
          Given a rediect exists with a To address of "Endpoint1"
          When another redirect is modified with a From address of "Endpoint1"
          Then the redirect is not modified
          And the user is notified that this action is invalid
        */

    /* SCENARIO
          Immediate retry
          
          Given an existing redirect
          When Modify Redirect is clicked
          And the "Immediately retry any matching failed messages" checkbox is checked
          And the Modify button is clicked
          Then the redirect is updated
          And a retry operation starts matching the from physical address
        */

    /* SCENARIO
          No immediate retry
          
          Given an existing redirect
          When Modify Redirect is clicked
          And the "Immediately retry any matching failed messages" checkbox is unchecked
          And the Modify button is clicked
          Then the redirect is updated
          And no retry operation starts
        */

    /* SCENARIO
          Cancel
          
          Given an existing redirect
          When Modify Redirect is clicked
          And the details of the redirect are changed
          And Cancel is clicked
          Then the Modify redirect dialog is closed
          And the redirect is not modified
        */
  });
  describe("Rule: End redirect", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Confirmed
          
          Given an existing redirect
          When End Redirect is clicked
          And Yes is clicked
          And the redirect is ended
        */

    /* SCENARIO
          Not confirmed
          
          Given an existing redirect
          When End Redirect is clicked
          And No is clicked
          And the redirect is still present
        */
  });
  describe("Rule: Redirect count", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Empty
          
          When there are no redirects
          Then the tab should include a (0) suffix
        */

    /* SCENARIO
          A redirect is added
          
          When a redirect is added
          Then the counter next to the tab should be incremented
        */

    /* SCENARIO
          A redirect is ended
          
          When a redirect is ended
          Then the counter next to the tab should be decremented
        */
  });
});
