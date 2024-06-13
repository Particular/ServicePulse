import { expect } from "vitest";
import { screen, waitFor } from "@testing-library/dom";
import { it, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { endpointsDetailsTitle } from "./questions/endpointDetailsTitle";
import { endpointsDetailsMessageName } from "./questions/endpointDetailsMessageTypeName";
import { monitoredEndpointTemplate, monitoredEndpointDetails } from "../../mocks/monitored-endpoint-template";
import * as warningQuestion from "./questions/endpointWarnings";
//import { endpointStaleWarning } from "./questions/endpointStaleWarning";

describe("FEATURE: Endpoint details", () => {
  describe("RULE: The details of an endpoint should be viewable on a dedicated page", () => {
    it.todo("Example: The endpoint name is clicked from the list of endpoints", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should hide if license has expired", () => {
    it.todo("Example: The endpoint has expired license", async ({ driver }) => {});
    it.todo("Example: The endpoint has valid license", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should display endpoint name correctly", () => {
    it("Example: Clicking an endpoint name from the endpoint monitoring list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);

      const endpointDetails = structuredClone(monitoredEndpointDetails);
      await driver.setUp(precondition.hasMonitoredEndpointDetails(endpointDetails));
      await driver.setUp(precondition.hasMonitoredEndpointRecoverabilityByInstance(endpointDetails.instances[0].id));

      await driver.goTo("/monitoring/endpoint/Endpoint1");
      expect(await endpointsDetailsTitle()).toBe("Endpoint1");
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
    it.todo("Example: The endpoint sends messages of type 'Message1,' 'Message2,' and 'Message3'", async ({ driver }) => {});
    it.todo("Example: Endpoint details should show correct counts for message types", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show all instances of the endpoint", () => {
    it.todo("Example: The endpoint has 1 instance running", async ({ driver }) => {});
    it.todo("Example: The endpoint has 3 instances running", async ({ driver }) => {});
  });
  describe("RULE: Endpoint detail graphs should update on period selector change", () => {
    it.todo("Example: One period is selected from the period selector", async ({ driver }) => {});
    it.todo("Example: Two different periods are selected from the period selector", async ({ driver }) => {});
  });
});
