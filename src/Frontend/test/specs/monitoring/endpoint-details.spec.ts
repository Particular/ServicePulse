import { expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/dom";
import { it, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { endpointsDetailsTitle } from "./questions/endpointDetailsTitle";
import { endpointMessageNames, endpointMessageTypesCount } from "./questions/endpointDetailsMessageTypes";
import { endpointInstanceNames, endpointInstancesCount } from "./questions/endpointDetailsInstances";
import { endpointDetailsGraphsCurrentValues } from "./questions/endpointDetailGraphsCurrentValues";
import { endpointDetailsGraphsAverageValues } from "./questions/endpointDetailGraphsAverageValues";
import { monitoredEndpointDetails } from "../../mocks/monitored-endpoint-template";
import * as warningQuestion from "./questions/endpointWarnings";
import { selectHistoryPeriod } from "./actions/selectHistoryPeriod";
import { paginationVisible } from "./questions/paginationVisible";

describe("FEATURE: Endpoint details", () => {
  describe("RULE: The details of an endpoint should be viewable on a dedicated page", () => {
    it.todo("Example: The endpoint name is clicked from the list of endpoints", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should hide if license has expired", () => {
    it.todo("Example: The endpoint has expired license", async ({ driver }) => {});
    it.todo("Example: The endpoint has valid license", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details include the endpoint name", () => {
    it("Example: Clicking an endpoint name from the endpoint monitoring list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);

      const endpointDetails = structuredClone(monitoredEndpointDetails);
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      await driver.goTo("/monitoring/endpoint/Endpoint1");
      expect(await endpointsDetailsTitle()).toBe("Endpoint1");
    });
  });
  describe("RULE: Endpoint detail graph data should be updated immediately after changing the history period", () => {
    it(`EXAMPLE: As history periods are selected the graph data values should update immediately`, async ({ driver }) => {
      //Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      const endpointDetails = structuredClone(monitoredEndpointDetails);
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      //Act
      await driver.goTo(`/monitoring/endpoint/Endpoint1`);

      // Assert for default monitored endpoint detail values
      await waitFor(async () => expect(await endpointDetailsGraphsCurrentValues()).toEqual(["2", "0", "0", "0", "0"]));
      await waitFor(async () => expect(await endpointDetailsGraphsAverageValues()).toEqual(["2", "1.97", "0", "74", "239"]));

      await driver.setUp(precondition.hasEndpointWithMetricValues(2, 2, 8, 9.56, 13.24, 10, 81, 78, 215, 220));
      await selectHistoryPeriod(5);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["2", "8", "13.24", "81", "215"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["2", "9.56", "10", "78", "220"]);

      await driver.setUp(precondition.hasEndpointWithMetricValues(5, 3.1, 12, 7.4, 2.2, 1, 124, 105.7, 201, 198));
      await selectHistoryPeriod(10);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["5", "12", "2.2", "124", "201"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["3.1", "7.4", "1", "105", "198"]);

      await driver.setUp(precondition.hasEndpointWithMetricValues(8, 6.5, 15, 12.6, 3.1, 2.4, 278, 255.3, 403, 387.8));
      await selectHistoryPeriod(15);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["8", "15", "3.1", "278", "403"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["6.5", "12.6", "2.4", "255", "387"]);

      await driver.setUp(precondition.hasEndpointWithMetricValues(1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 777.7, 888.8, 999.9, 800.8));
      await selectHistoryPeriod(30);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["1.1", "3.3", "5.5", "777", "999"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["2.2", "4.4", "6.6", "888", "800"]);

      await driver.setUp(precondition.hasEndpointWithMetricValues(9.999, 8.888, 7.777, 6.666, 5.555, 4.444, 333.333, 222.222, 111.111, 100.123));
      await selectHistoryPeriod(60);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["10", "7.78", "5.55", "333", "111"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["8.89", "6.67", "4.44", "222", "100"]);

      await driver.setUp(precondition.hasEndpointWithMetricValues(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
      await selectHistoryPeriod(1);

      expect(await endpointDetailsGraphsCurrentValues()).toEqual(["1", "3", "5", "7", "9"]);
      expect(await endpointDetailsGraphsAverageValues()).toEqual(["2", "4", "6", "8", "10"]);
    });
  });
  describe("RULE: An indication should be be displayed for the status of an endpoint", () => {
    it("Example: An endpoint has a negative critical time", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const endpointDetails = structuredClone(monitoredEndpointDetails);
      endpointDetails.instances[0].metrics.criticalTime.points.push(-1000);
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await warningQuestion.negativeCriticalTimeWarning()).toBeTruthy());
    });
    it("Example: An endpoint is stale", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const endpointDetails = structuredClone(monitoredEndpointDetails);
      endpointDetails.instances[0].isStale = true;
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await warningQuestion.endpointStaleWarning()).toBeTruthy());
    });
    it("Example: An endpoint is disconnected from ServiceControl monitoring", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const endpointDetails = structuredClone(monitoredEndpointDetails);
      endpointDetails.isScMonitoringDisconnected = true;
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await warningQuestion.endpointDisconnectedWarning()).toBeTruthy());
    });

    it("Example: An endpoint has a failed message", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      const endpointDetails = structuredClone(monitoredEndpointDetails);
      endpointDetails.errorCount = 5;
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await warningQuestion.endpointErrorCountWarning()).toBeTruthy());
      await waitFor(async () => expect(await warningQuestion.endpointErrorCount()).toBe("5"));
    });
  });
  describe("RULE: Endpoint details should show all message types for the endpoint", () => {
    it("Example: The endpoint sends messages of type 'Message1,' 'Message2,' and 'Message3'", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointMessageTypesNamed(["Message1", "Message2", "Message3"]));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await endpointMessageNames()).toEqual(["Message1", "Message2", "Message3"]));
    });
    it("Example: Endpoint details should show correct counts for message types", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointMessageTypesNamed(["Message1", "Message2", "Message3"]));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1");

      // Assert
      await waitFor(async () => expect(await endpointMessageTypesCount()).toEqual("3"));
    });
  });
  describe("RULE: Endpoint details should show all instances of the endpoint", () => {
    it("Example: The endpoint has 1 instance running", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointInstancesNamed(["Endpoint1"]));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1&tab=instancesBreakdown");

      // Assert
      await waitFor(async () => expect(await endpointInstancesCount()).toEqual("1"));
      await waitFor(async () => expect(await endpointInstanceNames()).toEqual(["Endpoint1"]));
    });
    it("Example: The endpoint has 3 instances running", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointInstancesNamed(["Endpoint1", "Endpoint2", "Endpoint3"]));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1?historyPeriod=1&tab=instancesBreakdown");

      // Assert
      await waitFor(async () => expect(await endpointInstancesCount()).toEqual("3"));
      await waitFor(async () => expect(await endpointInstanceNames()).toEqual(["Endpoint1", "Endpoint2", "Endpoint3"]));
    });
  });
  describe("RULE: Endpoint detail graphs should update on period selector change", () => {
    it.todo("Example: One period is selected from the period selector", async ({ driver }) => {});
    it.todo("Example: Two different periods are selected from the period selector", async ({ driver }) => {});
  });
  describe("RULE: Pagination should be displayed when more than 10 message types are present", () => {
    it("Example: 9 message types are present", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointMessageTypesNamed(new Array(9).fill("Message").map((name, index) => `${name}${index}`)));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1");

      // Assert
      await waitFor(async () => expect(paginationVisible()).not.toBeTruthy());
    });
    it("Example: 10 message types are present", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointMessageTypesNamed(new Array(10).fill("Message").map((name, index) => `${name}${index}`)));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("monitoring/endpoint/Endpoint1");

      // Assert
      await waitFor(async () => expect(paginationVisible()).not.toBeTruthy());
    });
    it("Example: 11 message types are present", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasEndpointMessageTypesNamed(new Array(11).fill("Message").map((name, index) => `${name}${index}`)));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance("Endpoint1"));

      // Act
      await driver.goTo("/monitoring/endpoint/Endpoint1");

      // Assert
      await waitFor(async () => expect(paginationVisible()).toBeTruthy());
    });
  });
});
