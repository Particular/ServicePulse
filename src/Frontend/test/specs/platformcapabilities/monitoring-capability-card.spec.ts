import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import { monitoringCapabilityCard, monitoringStatusBadge, monitoringActionButton, monitoringStatusIndicators, isMonitoringCardAvailable, isMonitoringCardNotConfigured, monitoringIndicatorByLabel } from "./questions/monitoringCapabilityCard";

describe("FEATURE: Monitoring capability card", () => {
  describe("RULE: When monitoring instance is available with endpoints sending data, show 'Available' status", () => {
    test("EXAMPLE: Monitoring instance available with monitored endpoints shows available status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoringWithEndpoints());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isMonitoringCardAvailable()).toBe(true);
      });

      const statusBadge = await monitoringStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Available/i);

      const actionButton = await monitoringActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/View Metrics/i);
    });
  });

  describe("RULE: When monitoring instance is available but no endpoints are sending data, show 'Endpoints Not Configured' status", () => {
    test("EXAMPLE: Monitoring instance available but no monitored endpoints shows not configured status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoringWithNoEndpoints);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isMonitoringCardNotConfigured()).toBe(true);
      });

      const actionButton = await monitoringActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/Learn More/i);
    });
  });

  describe("RULE: Status indicators should show instance and metrics status", () => {
    test("EXAMPLE: Available monitoring instance shows instance indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoringWithEndpoints());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await monitoringStatusIndicators();
        expect(indicators).not.toBeNull();
        expect(indicators!.length).toBeGreaterThanOrEqual(1);
      });

      const instanceIndicator = await monitoringIndicatorByLabel("Instance");
      expect(instanceIndicator).toBeInTheDocument();
    });

    test("EXAMPLE: Available monitoring instance with endpoints shows metrics indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMonitoringWithEndpoints());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const metricsIndicator = await monitoringIndicatorByLabel("Metrics");
        expect(metricsIndicator).toBeInTheDocument();
      });
    });
  });
});
