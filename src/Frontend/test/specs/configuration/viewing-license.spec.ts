import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { licenseTypeDetails } from "./questions/licenseTypeDetails";
import { licenseExpiryDate } from "./questions/licenseExpiryDate";
import { licenseExpiryDaysLeft } from "./questions/licenseExpiryDaysLeft";
import { licenseExpired } from "./questions/licenseExpired";
import { waitFor } from "@testing-library/vue";
import { LicenseType } from "@/resources/LicenseInfo";

describe("FEATURE: License", () => {
  describe("RULE: Platform license type should be shown shown", () => {
    test("EXAMPLE: Valid platform license type should be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasActiveLicense);
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseTypeDetails()).toBe("Commercial, Enterprise");
      });
    });
  });

  describe("RULE: License expiry date should be shown", () => {
    test("EXAMPLE: Valid license expiry date should be shown", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasActiveLicense);
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseExpiryDate()).toBeVisible();
      });
    });
  });

  describe("RULE: License expired", () => {
    test("EXAMPLE: An expired license should show 'expired'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.withExpiredLicense(LicenseType.Subscription, 5)); //license expired 6 days before
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseExpired()).toBe("Your license expired. Please update the license to continue using the Particular Service Platform.");
      });
    });
  });

  describe("RULE: License expiring soon must be displayed", () => {
    test("EXAMPLE: License expiring with x days should show 'expiring in X days'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.withExpiringLicense(LicenseType.Subscription, 10));
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseExpiryDaysLeft()).toBeVisible(); //License expiry date: 2/5/2025 - expiring in 11 days
        expect(await licenseExpiryDaysLeft()).toContain("expiring in"); //License expiry date: 2/5/2025 - expiring in 11 days
      });
    });
    test("EXAMPLE: License expiring tomorrow should show 'expiring tomorrow'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.withExpiringLicense(LicenseType.Subscription, 0));
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseExpiryDaysLeft()).toBeVisible();
        expect(await licenseExpiryDaysLeft()).toContain("expiring tomorrow");
      });
    });
    test("EXAMPLE: License expiring today should show 'expiring today'", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.withExpiringLicense(LicenseType.Subscription, -1));
      await driver.goTo("/configuration/license");
      await waitFor(async () => {
        expect(await licenseExpiryDaysLeft()).toBeVisible();
        expect(await licenseExpiryDaysLeft()).toContain("expiring today");
      });
    });
  });

  // describe("RULE: Remaining license period should be displayed", () => {
  //   test("EXAMPLE: License expiring in more than 10 days should show 'X days left", async ({ driver }) => {
  //     /* SCENARIO
  //         License expiring in the future

  //         Given a platform license which expires more than 10 days from now
  //         Then "X days left" is shown
  //       */
  //     await driver.setUp(precondition.serviceControlWithMonitoring);
  //     await driver.setUp(precondition.hasActiveLicense);
  //     await driver.goTo("/configuration/license");
  //     waitFor(async () => {
  //       expect(await licenseExpiryDaysLeft()).toContain("days left");
  //     });
  //   });
  // });
  describe("RULE: Non-license options should be hidden if license has expired", () => {
    test.todo("EXAMPLE: Only 'LICENSE' tab is visible when license has expired");

    /* SCENARIO
          Given an expired license
          Then "LICENSE" is the only visible tab in the Configuration screen
        */
  });
});
