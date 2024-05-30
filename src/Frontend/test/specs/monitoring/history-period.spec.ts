import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen, waitFor } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { groupingOptionWithName } from "./questions/groupingOptionWithName";
import { selectHistoryPeriod } from "./actions/selectHistoryPeriod";
import { endpointSparklineValues } from "./questions/endpointSparklineValues";
import { generatedProcessingTimePoints, oneEndpointWithHistoryPeriodFor } from "../../mocks/history-period-template";
import { historyPeriodSelected } from "./questions/historyPeriodSelected";
import { endpointDetailsLinks } from "./questions/endpointDetailsLinks";

const monitoringInstanceUrl = window.defaultConfig.monitoring_urls[0];

describe("FEATURE: Endpoint history periods", () => {
  describe("RULE: History period should get and set the permalink history period query parameter", () => {
    [
      { description: "History period '1m' selected and permalink history period query parameter should be set to 1", historyPeriod: 1 },
      { description: "History period '5m' selected and permalink history period query parameter should be set to 5", historyPeriod: 5 },
      { description: "History period '10m' selected and permalink history period query parameter should be set to 10", historyPeriod: 10 },
      { description: "History period '15m' selected and permalink history period query parameter should be set to 15", historyPeriod: 15 },
      { description: "History period '30m' selected and permalink history period query parameter should be set to 30", historyPeriod: 30 },
      { description: "History period '1h' selected and permalink history period query parameter should be set to 60", historyPeriod: 60 },
    ].forEach(({ description, historyPeriod }) => {
      it(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1"]));

        //Act
        await driver.goTo(`monitoring`);
        await selectHistoryPeriod(historyPeriod);

        //Assert
        expect(window.location.href).toEqual(`http://localhost:3000/#/monitoring?historyPeriod=${historyPeriod}`);
      });
    });
    [
      { description: "History period query parameter is set to 1 and History period '1m' should be selected", historyPeriod: 1 },
      { description: "History period query parameter is set to 5 and History period '5m' should be selected", historyPeriod: 10 },
      { description: "History period query parameter is set to 10 and History period '10m' should be selected", historyPeriod: 15 },
      { description: "History period query parameter is set to 15 and History period '15m' should be selected", historyPeriod: 30 },
      { description: "History period query parameter is set to 30 and History period '30m' should be selected", historyPeriod: 30 },
      { description: "History period query parameter is set to 60 and History period '1h' should be selected", historyPeriod: 60 },
    ].forEach(({ description, historyPeriod }) => {
      it(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1"]));

        //Act
        await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);

        //Assert
        expect(await historyPeriodSelected(historyPeriod)).toEqual("true");
      });
    });
    it("EXAMPLE: No history query parameter set and History period '1m' should be selected", async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1"]));

      //Act
      await driver.goTo("monitoring");

      //Assert
      expect(await historyPeriodSelected(1)).toEqual("true");
    });
    [
      { description: "Selecting history period '1m' should update the endpoint name link with the history period selected for details", historyPeriod: 1 },
      { description: "Selecting history period '10m' should update the endpoint name link with the history period selected for details", historyPeriod: 15 },
      { description: "Selecting history period '15m' should update the endpoint name link with the history period selected for details", historyPeriod: 10 },
      { description: "Selecting history period '30m' should update the endpoint name link with the history period selected for details", historyPeriod: 30 },
      { description: "Selecting history period '1h' should update the endpoint name link with the history period selected for details", historyPeriod: 60 },
    ].forEach(({ description, historyPeriod }) => {
      it(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.monitoredEndpointsNamed(["Endpoint1", "Endpoint2"]));

        //Act
        await driver.goTo(`monitoring`);
        await selectHistoryPeriod(historyPeriod);

        //Assert
        expect(await endpointDetailsLinks()).toEqual([`#/monitoring/endpoint/Endpoint1?historyPeriod=${historyPeriod}`, `#/monitoring/endpoint/Endpoint2?historyPeriod=${historyPeriod}`]);
      });
    });
  });
  //TODO: add test to check if history period data is fetched immediately after the history period is updated
  describe("RULE: Endpoint history period data should be fetched immediately after the history period is updated", () => {
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

        let foo = false;
        console.log(`First Foo: ${foo}, History Period: ${historyPeriod}`);

        const callback = () => {
          foo = true;
          console.log(`Second Foo: ${foo}, History Period: ${historyPeriod}`);
        };

        driver.mockEndpoint(`${monitoringInstanceUrl}monitored-endpoints?history=${historyPeriod}`, {
          body: [oneEndpointWithHistoryPeriodFor(historyPeriod)],
          callback,
        });

        //Act
        await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);
        //await driver.goTo(`monitoring`);
        //await selectHistoryPeriod(historyPeriod);
      });
    });
  });
  //TODO: add test to check if endpoint history period data is fetched at the interval selected by the history period
  describe("RULE: Endpoint history period data should be fetched at the interval selected by the history period", () => {
    [
      { description: "History period is set to 1 minute", historyPeriod: 1 },
      { description: "History period is set to 5 minutes", historyPeriod: 5 },
      { description: "History period is set to 10 minutes", historyPeriod: 10 },
      { description: "History period is set to 15 minutes", historyPeriod: 15 },
      { description: "History period is set to 30 minutes", historyPeriod: 30 },
      { description: "History period is set to 60 minutes", historyPeriod: 60 },
    ].forEach(({ description, historyPeriod }) => {
      it.todo(`EXAMPLE: ${description}`, async ({ driver }) => {
        //Arrange
        await driver.setUp(precondition.serviceControlWithMonitoring);
        await driver.setUp(precondition.hasOneEndpointWithHistoryPeriodDataFor(1));
        //await driver.setUp(precondition.hasOneEndpointWithHistoryPeriodDataFor(historyPeriod));

        //Act
        await driver.goTo(`monitoring`);
        //expect(await endpointSparklineValues("Endpoint1")).toEqual(["14", "9.28", "13.8", "76", "217"]);
        //console.log(await endpointSparklineValues("Endpoint1"));
        //await selectHistoryPeriod(historyPeriod);
        await driver.setUp(precondition.hasOneEndpointWithHistoryPeriodDataFor(historyPeriod));
        //await driver.goTo(`monitoring?historyPeriod=${historyPeriod}`);
        //var foo = generatedProcessingTimePoints(historyPeriod);
        //console.log(foo);
        //expect(await endpointSparklineValues("Endpoint1")).toEqual(["14", "9.28", "13.8", "76", "217"]);
        //screen.logTestingPlaygroundURL();
        //console.log(await endpointSparklineValues("Endpoint1"));
        expect(await endpointSparklineValues("Endpoint1")).toEqual(["2.96", "2.26", "2.1", "36", "147"]);
        //expect(await groupingOptionWithName(/no grouping/i)).toBeInTheDocument();
      });
    });
  });
});
