import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen, waitForElementToBeRemoved } from "@testing-library/vue";
import * as precondition from "../../preconditions";

describe("Feature: Backend mininum requirements checking", () => {
  describe("Rule: It should be validated that ServiceControl version is at least 5.0.0", () => {
    
    it("Example: ServiceControl main instance is 5.0.0", async ({driver}) => {
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasServiceControlVersion("5.0.0"));

        //Act
        await driver.goTo("usage");
        
        //Await for the version to be displayed - TODO: replace to use role and/or aria-lable
        expect(await screen.findByText(/v5\.0\.0/i)).toBeInTheDocument();

        //Replace this with a role and/or aria-label
        expect(screen.queryByText(/the minimum version of servicecontrol required to enable the usage feature is \./i)).not.toBeInTheDocument();
        //screen.logTestingPlaygroundURL();
    });

    it("Example: ServiceControl main instance is 4.9.0", async ({driver}) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);        
        await driver.setUp(precondition.hasServiceControlVersion("4.9.0"));

        //Act
        await driver.goTo("usage");
        
        //Await for the version to be displayed - TODO: replace to use role and/or aria-lable
        expect(await screen.findByText(/v4\.9\.0/i)).toBeInTheDocument();

        //Replace this with a role and/or aria-label
        expect(await screen.findByText(/the minimum version of servicecontrol required to enable the usage feature is \./i)).toBeInTheDocument();
    });

    
  });
});