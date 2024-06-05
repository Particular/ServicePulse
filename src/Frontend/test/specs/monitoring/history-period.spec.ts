import { expect, vi } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import { screen } from "@testing-library/vue";
import * as precondition from "../../preconditions";
import { selectHistoryPeriod } from "./actions/selectHistoryPeriod";
import { endpointSparklineValues } from "./questions/endpointSparklineValues";
import * as historyPeriodTemplate from "../../mocks/history-period-template";
import { historyPeriodSelected } from "./questions/historyPeriodSelected";
import { endpointDetailsLinks } from "./questions/endpointDetailLinks";
import { monitoredEndpointTemplate } from "../../mocks/monitored-endpoint-template";

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
      { description: "History period query parameter is set to 1 and history period '1m' should be selected", historyPeriod: 1 },
      { description: "History period query parameter is set to 5 and history period '5m' should be selected", historyPeriod: 10 },
      { description: "History period query parameter is set to 10 and history period '10m' should be selected", historyPeriod: 15 },
      { description: "History period query parameter is set to 15 and history period '15m' should be selected", historyPeriod: 30 },
      { description: "History period query parameter is set to 30 and history period '30m' should be selected", historyPeriod: 30 },
      { description: "History period query parameter is set to 60 and history period '1h' should be selected", historyPeriod: 60 },
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
  describe("RULE: Endpoint history period data should be fetched immediately after the history period is updated", () => {
    it(`EXAMPLE: As history periods are selected the endpoint sparkline data should update immediately`, async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointWithMetricsPoints(1, 14, 9.28, 13.8, 76, 217));

      //Act & Assert
      await driver.goTo(`monitoring`);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["14", "9.28", "13.8", "76", "217"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 2.96, 2.26, 2.1, 36, 147));
      await selectHistoryPeriod(5);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["2.96", "2.26", "2.1", "36", "147"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(10, 10, 6.98, 9.97, 63, 194));
      await selectHistoryPeriod(10);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["10", "6.98", "9.97", "63", "194"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(15, 3.65, 2.7, 2.84, 39, 152));
      await selectHistoryPeriod(15);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["3.65", "2.7", "2.84", "39", "152"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(30, 12, 7.87, 11.45, 68, 203));
      await selectHistoryPeriod(30);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "7.87", "11.45", "68", "203"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(60, 13, 8.37, 11.61, 72, 206));
      await selectHistoryPeriod(60);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["13", "8.37", "11.61", "72", "206"]);
    });
  });
  //TODO: add test to check if history period data is fetched immediately after the history period is updated
  describe("RULE: Endpoint history period data should be fetched at the interval selected by the history period", () => {
    /*     [
      { description: "History period is set to 1 minute and changed to 5 minutes", initialPeriod: 1, historyPeriod: 5 },
      { description: "History period is set to 1 minute and changed to 10 minutes", initialPeriod: 1, historyPeriod: 10 },
      { description: "History period is set to 1 minute and changed to 15 minutes", initialPeriod: 1, historyPeriod: 15 },
      { description: "History period is set to 1 minute and changed to 30 minutes", initialPeriod: 1, historyPeriod: 30 },
      { description: "History period is set to 1 minute and changed to 60 minutes", initialPeriod: 1, historyPeriod: 60 },
      { description: "History period is set to 60 minutes and changed to 1 minute", initialPeriod: 60, historyPeriod: 1 },
    ].forEach(({ description, initialPeriod, historyPeriod }) => { */
    it(`EXAMPLE: As history periods are selected the endpoint sparkline data should updated at the interval selected by the history period`, async ({ driver }) => {
      //Arrange
      //await driver.setUp(precondition.serviceControlWithMonitoring);
      //await driver.setUp(precondition.hasEndpointWithMetricsPoints(initialPeriod, 14, 9.28, 13.8, 76, 217));
      //await driver.setUp(precondition.hasHistoryPeriodDataForOneMinute);

      //vi.useFakeTimers();      
      vi.useFakeTimers(); // Needs to be called before the first call to setInterval
          //Arrange
          await driver.setUp(precondition.serviceControlWithMonitoring);
          await driver.setUp(precondition.hasEndpointWithMetricsPoints(1, 14, 9.28, 13.8, 76, 217));

          //Act & Assert
          await driver.goTo(`monitoring`);
          

          const endpoint1 = structuredClone(monitoredEndpointTemplate);          
          endpoint1.name = "Endpoint1";
          endpoint1.metrics.queueLength.points.push(14);
          endpoint1.metrics.throughput.points.push(9.28);
          endpoint1.metrics.retries.points.push(13.8);
          endpoint1.metrics.processingTime.points.push(76);
          endpoint1.metrics.criticalTime.points.push(217);      

          await driver.setUp(precondition.hasMonitoredEndpointsList([endpoint1]));
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["14", "9.28", "13.8", "76", "217"]);

          await driver.setUp(precondition.hasEndpointWithMetricsPoints(1, 12, 9.56, 13.24, 81, 209));          
          // //await vi.runOnlyPendingTimersAsync(); 
          await vi.advanceTimersByTimeAsync(1000);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "209"]);
          
          await driver.setUp(precondition.hasEndpointWithMetricsPoints(1, 12, 9.56, 13.24, 81, 210));
          await vi.advanceTimersByTimeAsync(1000);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "210"]);

          await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 12, 9.56, 13.24, 81, 215));
          // //vi.useRealTimers();
           await vi.runOnlyPendingTimersAsync();
           await selectHistoryPeriod(5,true);          
           expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "215"]);
          // //vi.useFakeTimers();

          await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 12, 9.56, 13.24, 81, 220));
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "215"]);

          await vi.advanceTimersByTimeAsync(4000);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "215"]);

          await vi.advanceTimersByTimeAsync(500);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "215"]);

          await vi.advanceTimersByTimeAsync(499);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "215"]);

          await vi.advanceTimersByTimeAsync(1);
          expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "220"]);

    vi.useRealTimers();     

      //await selectHistoryPeriod(5);
      //await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the next tick to run the timers
      // expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.56", "13.24", "81", "209"]);

      // await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 12, 8.56, 13.24, 81, 209));
      // await selectHistoryPeriod(5);
      // expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "8.56", "13.24", "81", "209"]);

      // //vi.useFakeTimers();
      // await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 12, 10.56, 12.24, 81, 209));
      // await vi.advanceTimersByTimeAsync(5000);
      // vi.runOnlyPendingTimers();
      // //await vi.runOnlyPendingTimersAsync();
      // //vi.useRealTimers();

      // await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for the next tick to run the timers
      // expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "10.56", "12.24", "81", "209"]);
      // vi.useRealTimers();
      //await driver.setUp(precondition.hasEndpointWithMetricsPoints(1, 12, 9.57, 13.24, 81, 209));
      //await vi.runOnlyPendingTimersAsync();

      //expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "9.57", "13.24", "81", "209"]);
      //vi.useRealTimers();

      /*  await driver.setUp(precondition.hasEndpointWithMetricsPoints(5, 2.96, 2.26, 2.1, 36, 147));
      await selectHistoryPeriod(5);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["2.96", "2.26", "2.1", "36", "147"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(10, 10, 6.98, 9.97, 63, 194));
      await selectHistoryPeriod(10);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["10", "6.98", "9.97", "63", "194"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(15, 3.65, 2.7, 2.84, 39, 152));
      await selectHistoryPeriod(15);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["3.65", "2.7", "2.84", "39", "152"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(30, 12, 7.87, 11.45, 68, 203));
      await selectHistoryPeriod(30);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["12", "7.87", "11.45", "68", "203"]);

      await driver.setUp(precondition.hasEndpointWithMetricsPoints(60, 13, 8.37, 11.61, 72, 206));
      await selectHistoryPeriod(60);
      expect(await endpointSparklineValues("Endpoint1")).toEqual(["13", "8.37", "11.61", "72", "206"]); */

      //let foo = false;
      //console.log(`First Foo: ${foo}, History Period: ${historyPeriod}`);

      /* const callback = () => {
          foo = true;
          console.log(`Second Foo: ${foo}, History Period: ${historyPeriod}`);
        }; */

      /*  driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${historyPeriod}`, {
          body: [historyPeriodTemplate.oneEndpointWithHistoryPeriodFor(historyPeriod)],
          callback,
        }); */

      /* driver.mockEndpoint(`${window.defaultConfig.monitoring_urls[0]}monitored-endpoints?history=${initialPeriod}`, {
          //body: [historyPeriodTemplate.oneEndpointWithHistoryPeriodFor(historyPeriod)],
          body: [historyPeriodTemplate.oneEndpointWithMetricsPoints(14, 9.28, 13.8, 76, 217)],
          callback,
          //callback,
        }); */

      //Act
      //await driver.goTo(`monitoring?historyPeriod=${initialPeriod}`);
      //await driver.goTo(`monitoring`);
      //expect(await endpointSparklineValues("Endpoint1")).toEqual(["14", "9.28", "13.8", "76", "217"]);
      //await selectHistoryPeriod(historyPeriod);
      //});
    });
  });
});
