import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { groupingOptionWithName } from "./questions/groupingOptionWithName";

describe("FEATURE: Viewing different endpoint history periods", () => {
  describe("RULE: Endpoint list should display the correct history data from the permalink history query parameter", () => {
    it("EXAMPLE: No history query parameter set", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasNoMonitoredEndpoints);
      //Act
      await driver.goTo("monitoring");

      //expect(await screen.findByText(/the monitoring service is active but no data is being returned\./i)).toBeInTheDocument();
    });
    [
      { description: "History query parameter set to 1", historyPeriod: 1 },
      { description: "History query parameter set to 5", historyPeriod: 5 },
      { description: "History query parameter set to 10", historyPeriod: 10 },
      { description: "History query parameter set to 15", historyPeriod: 15 },
      { description: "History query parameter set to 30", historyPeriod: 30 },
      { description: "History query parameter set to 60", historyPeriod: 60 },
    ].forEach(({ description, historyPeriod }) => {
      it.only(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasHistoryPeriodDataForOneMinute);
        //Act
        await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);

        //expect(await screen.findByText(/the monitoring service is active but no data is being returned\./i)).toBeInTheDocument();
      });
    });
  });
  describe("RULE: When history period is changed the endpoint list should display the correct history data", () => {
    [
      { description: "History period is set to 1 minute and changed to 5 minutes", historyPeriod: 5 },
      { description: "History period is set to 1 minute and changed to 10 minutes", historyPeriod: 10 },
      { description: "History period is set to 1 minute and changed to 15 minutes", historyPeriod: 15 },
      { description: "History period is set to 1 minute and changed to 30 minutes", historyPeriod: 30 },
      { description: "History period is set to 1 minute and changed to 60 minutes", historyPeriod: 60 },
      { description: "History period is set to 60 minutes and changed to 1 minute", historyPeriod: 1 },
    ].forEach(({ description, historyPeriod }) => {
      it(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasHistoryPeriodDataForOneMinute);
        //Act
        await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);

        expect(await screen.findByText(/the monitoring service is active but no data is being returned\./i)).toBeInTheDocument();
      });
    });
  });
  describe("RULE: Selecting a history period should update the historyPeriod parameter in the permalink", () => {
    [
      { description: "History period is set to 1 minute and changed to 5 minutes", historyPeriod: 5 },
      { description: "History period is set to 1 minute and changed to 10 minutes", historyPeriod: 10 },
      { description: "History period is set to 1 minute and changed to 15 minutes", historyPeriod: 15 },
      { description: "History period is set to 1 minute and changed to 30 minutes", historyPeriod: 30 },
      { description: "History period is set to 1 minute and changed to 60 minutes", historyPeriod: 60 },
      { description: "History period is set to 60 minutes and changed to 1 minute", historyPeriod: 1 },
    ].forEach(({ description, historyPeriod }) => {
      it.only(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasOneEndpointWithHistoryPeriodDataFor(historyPeriod));
        //Act
        await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);
        expect(await groupingOptionWithName(/no grouping/i)).toBeInTheDocument();
        screen.logTestingPlaygroundURL();
        expect(await screen.findByText(/the monitoring service is active but no data is being returned\./i)).toBeInTheDocument();
      });
    });
  });
});
