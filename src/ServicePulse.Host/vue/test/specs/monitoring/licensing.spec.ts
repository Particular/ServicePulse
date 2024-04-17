import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";

describe("FEATURE: License expired - from monitoring", () => {
  describe("RULE: Platform expired", () => {
    it("EXAMPLE: Platform expired", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasNoMonitoredEndpoints);
      await driver.setUp(precondition.hasPlatformExpiredLicense);
      //Act
      await driver.goTo("monitoring");
      
      expect(await screen.findByText(/Platform license expired\./i)).toBeInTheDocument();
      expect(await screen.findByText(/Please update your license to continue using the Particular Service Platform\./i)).toBeInTheDocument();
    });
  });
});
