import { expect } from "vitest";
import { test, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { Expired } from "../../preconditions";

describe("FEATURE: expiring license detection", () => {
    describe("RULE: The user should be alerted while using the {monitoring endpoint list} functionality about an EXPIRING license", () => {
      test.todo("EXAMPLE: Expiring trial");
      test.todo("EXAMPLE: Expiring upgrade protection");
      test.todo("EXAMPLE: Expiring platform subscription");      
    });

    describe("RULE: The user should be alerted while using the {monitoring endpoint list} functionality about an EXPIRED license", () => {
        test.todo("EXAMPLE: Expired trial");
        test.todo("EXAMPLE: Expired upgrade protection");
        test.todo("EXAMPLE: Expired platform subscription");      
      });
  });

describe("FEATURE: expired license detection", () => {
    const serviceControlInstanceUrl = window.defaultConfig.service_control_url;

  //As of the moment of writing this test, license check is performed during the first load of the application only. No continuous check is performed.
  describe("RULE: Access to the {monitoring endpoint list} functionality should be blocked when a expired license is detected upon loading the application", () => {
    test("EXAMPLE: Expired trial", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasLicenseWith(Expired.Trial));
      
      //Act
      await driver.goTo("monitoring");

      expect(await screen.findByText(/to continue using the particular service platform, please extend your license/i)).toBeInTheDocument();      
      expect(screen.getByRole("link", { name: "Extend your license" })).toHaveAttribute("href", "https://particular.net/extend-your-trial?p=servicepulse");
      
      expect(screen.getByRole("link", { name: "View license details" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View license details" })).toHaveAttribute("href", "#/configuration/license");
    });

    test("EXAMPLE: Expired platform subscription", async ({ driver }) => {    
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);  
        await driver.setUp(precondition.hasLicenseWith(Expired.Subscription));
        
        //Act
        await driver.goTo("monitoring");
  
        expect(await screen.findByText(/please update your license to continue using the particular service platform/i)).toBeInTheDocument();        
        
        expect(screen.getByRole("link", { name: "View license details" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "View license details" })).toHaveAttribute("href", "#/configuration/license");
      });

      test("EXAMPLE: Expired upgrade protection", async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);  
        await driver.setUp(precondition.hasLicenseWith(Expired.UpgradeProtection));      
        
        //Act
        await driver.goTo("monitoring");
  
        expect(await screen.findByText(/your upgrade protection period has elapsed and your license is not valid for this version of servicepulse\./i)).toBeInTheDocument();        
        expect(screen.getByRole("link", { name: "View license details" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "View license details" })).toHaveAttribute("href", "#/configuration/license");
      });
  });
});