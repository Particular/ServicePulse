import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import {
  monitoringCapabilityCard,
  monitoringStatusBadge,
  monitoringActionButton,
  monitoringStatusIndicators,
  isMonitoringCardAvailable,
  isMonitoringCardNotConfigured,
  isMonitoringCardUnavailable,
  monitoringIndicatorByLabel,
} from "./questions/monitoringCapabilityCard";
import { disableMonitoring } from "../../drivers/vitest/setup";

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

  describe("RULE: When monitoring instance is configured but not responding, show 'Unavailable' status", () => {
    test("EXAMPLE: Monitoring instance unavailable shows unavailable status", async ({ driver }) => {
      // Arrange - Set up base preconditions first
      await driver.setUp(precondition.hasAuthenticationDisabled());
      await driver.setUp(precondition.hasActiveLicense);
      await driver.setUp(precondition.hasLicensingSettingTest());
      await driver.setUp(precondition.hasServiceControlMainInstance());
      await driver.setUp(precondition.hasUpToDateServiceControl);
      await driver.setUp(precondition.hasUpToDateServicePulse);
      await driver.setUp(precondition.errorsDefaultHandler);
      await driver.setUp(precondition.hasCustomChecksEmpty);
      await driver.setUp(precondition.hasEventLogItems);
      await driver.setUp(precondition.hasRecoverabilityGroups);
      await driver.setUp(precondition.hasNoHeartbeatsEndpoints);
      await driver.setUp(precondition.hasNoMonitoredEndpoints);
      await driver.setUp(precondition.endpointRecoverabilityByInstanceDefaultHandler);
      await driver.setUp(precondition.endpointRecoverabilityByNameDefaultHandler);
      await driver.setUp(precondition.serviceControlMonitoringOptions);
      await driver.setUp(precondition.serviceControlConfigurationDefaultHandler);
      await driver.setUp(precondition.recoverabilityClassifiers);
      await driver.setUp(precondition.recoverabilityHistoryDefaultHandler);
      await driver.setUp(precondition.recoverabilityEditConfigDefaultHandler);
      await driver.setUp(precondition.archivedGroupsWithClassifierDefaulthandler);
      await driver.setUp(precondition.recoverabilityGroupsWithClassifierDefaulthandler);
      await driver.setUp(precondition.hasLicensingReportAvailable());
      await driver.setUp(precondition.hasLicensingEndpoints());
      await driver.setUp(precondition.hasEndpointSettings([]));
      await driver.setUp(precondition.redirectsDefaultHandler);
      await driver.setUp(precondition.knownQueuesDefaultHandler);
      await driver.setUp(precondition.hasRemoteInstances());
      await driver.setUp(precondition.hasMessages());
      // Set up monitoring as unavailable LAST to override any earlier mocks
      await driver.setUp(precondition.hasMonitoringUnavailable);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isMonitoringCardUnavailable()).toBe(true);
      });

      const statusBadge = await monitoringStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Unavailable/i);
    });
  });

  describe("RULE: When monitoring is not configured in ServicePulse, show 'Instance Not Configured' status", () => {
    test("EXAMPLE: Monitoring not configured shows get started button", async ({ driver }) => {
      // Arrange - Disable monitoring in ServicePulse config
      disableMonitoring();
      await driver.setUp(precondition.serviceControlWithMonitoring);

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
      expect(actionButton?.textContent).toMatch(/Get Started/i);
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
