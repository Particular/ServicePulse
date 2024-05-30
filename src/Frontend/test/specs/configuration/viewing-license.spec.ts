import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: License", () => {
  describe("Rule: Platform license type is shown", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given the platform license is valid
          Then the platform license type is shown
        */
  });
  describe("Rule: License expiry date is shown", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given a valid platform license
          Then the license expiry date is shown
        */
  });
  describe("Rule: Remaining license period is displayed", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Expired license
          
          Given an expired platform license
          Then "expired" is shown
        */

    /* SCENARIO
          License expiring soon
          
          Given a platform license with an expiry date within 10 days
          Then "expiring in X days" is shown
        */

    /* SCENARIO
          License expiring tomorrow
          
          Given a platform license which expires tomorrow
          Then "expiring tomorrow" is shown
        */

    /* SCENARIO
          License expiring today
          
          Given a platform license which expires today
          Then "expiring today" is shown
        */

    /* SCENARIO
          License expiring in the future
          
          Given a platform license which expires more than 10 days from now
          Then "X days left" is shown
        */
  });
  describe("Rule: Non-license options are hidden if license has expired", () => {
    it.todo("Not implemented");

    /* SCENARIO
          Given an expired license
          Then "LICENSE" is the only visible tab in the Configuration screen
        */
  });
});
