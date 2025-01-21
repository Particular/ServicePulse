import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { licenseTypeDetails } from "./questions/licenseTypeDetails";
import { licenseExpiryDate } from "./questions/licenseExpiryDate";
import { licenseExpiryDaysLeft } from "./questions/licenseExpiryDaysLeft";
import { waitFor } from "@testing-library/vue";

describe("FEATURE: License", () => {
  describe("RULE: Platform license type should be shown shown", () => {
    test("EXAMPLE: Valid platform license type should be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasActiveLicense);
      await driver.goTo("/configuration/license");
      waitFor(async () => {
        expect(await licenseTypeDetails()).toBe("Commercial, Enterprise");
      });
    });
  });
  describe("RULE: License expiry date should be shown", () => {
    test("EXAMPLE: Valid license expiry date should be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasActiveLicense);
      await driver.goTo("/configuration/license");
      waitFor(async () => {
        expect(await licenseExpiryDate()).toBeVisible();
      });
    });
  });
  describe("RULE: Remaining license period should be displayed", () => {
    test.todo("EXAMPLE: An expired license should show 'expired'");
    /* SCENARIO
            Expired license
   
            Given an expired platform license
            Then "expired" is shown            
          */
  });
  describe("RULE: License expiring soon must be displayed", () => {
    test("EXAMPLE: License expiring with 10 days should show 'expiring in X days'", async ({ driver }) => {
      /* SCENARIO
          License expiring soon
 
          Given a platform license with an expiry date within 10 days
          Then "expiring in X days" is shown
        */
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const x = precondition.hasExpiringLicense(precondition.LicenseType.Subscription);
      console.log(x);
      await driver.setUp(precondition.hasExpiringLicense(precondition.LicenseType.Subscription));
      await driver.goTo("/configuration/license");
      waitFor(async () => {
        expect(await licenseExpiryDaysLeft()).toBeVisible();
      });
    });
  });
  describe("RULE: ABC", () => {
    test.todo("EXAMPLE: License expiring tomorrow should show 'expiring tomorrow'");
    /* SCENARIO
          License expiring tomorrow
 
          Given a platform license which expires tomorrow
          Then "expiring tomorrow" is shown
        */
  });
  describe("RULE: EFG", () => {
    test.todo("EXAMPLE: License expiring today should show 'expiring today'");
    /* SCENARIO
          License expiring today
 
          Given a platform license which expires today
          Then "expiring today" is shown
        */
  });
  describe("RULE: Remaining license period should be displayed", () => {
    test("EXAMPLE: License expiring in more than 10 days should show 'X days left", async ({ driver }) => {
      /* SCENARIO
          License expiring in the future
 
          Given a platform license which expires more than 10 days from now
          Then "X days left" is shown
        */
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasActiveLicense);
      await driver.goTo("/configuration/license");
      waitFor(async () => {
        expect(await licenseExpiryDaysLeft()).toContain("days left");
      });
    });
  });
  describe("RULE: Non-license options should be hidden if license has expired", () => {
    test.todo("EXAMPLE: Only 'LICENSE' tab is visible when license has expired");

    /* SCENARIO
          Given an expired license
          Then "LICENSE" is the only visible tab in the Configuration screen
        */
  });
});
