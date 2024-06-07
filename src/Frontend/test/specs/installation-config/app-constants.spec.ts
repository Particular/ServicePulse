import { expect, vi } from "vitest";
import { screen } from "@testing-library/vue"; 
import { it, describe } from "../../drivers/vitest/driver";
import { waitFor } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { endpointsNames } from "../monitoring/questions/endpointsNames";

describe("FEATURE: app.constants.js", () => {
  describe("RULE: The system should automatically navigate to the specified path in default_rule property", () => {
    it("EXAMPLE: default route is set to /dashboard", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      window.defaultConfig.default_route = "/dashboard";
      await driver.goTo("/");

      await waitFor(async () => {
        expect(window.location.href).toBe("http://localhost:3000/#/dashboard");
      });
    });

    it("EXAMPLE: default route is set to /monitoring", async ({ driver }) => {      
      
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1"]));

      window.defaultConfig.default_route = "/monitoring";
      
      await driver.goTo("/");
      expect(await endpointsNames()).toEqual(["Endpoint1"]);

      expect(window.location.href).toBe("http://localhost:3000/#/monitoring");
      
    });

    it("EXAMPLE: default route is not set", async ({ driver }) => {      
      
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
            
      window.defaultConfig.default_route = "";
      
      await driver.goTo("");

      await waitFor(async () => {
        expect(window.location.href).toBe("http://localhost:3000/#/");
      });
    });

  });
});
