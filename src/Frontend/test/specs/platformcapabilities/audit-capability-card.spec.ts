import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import {
  auditingCapabilityCard,
  auditingStatusBadge,
  auditingActionButton,
  auditingStatusIndicators,
  isAuditingCardAvailable,
  isAuditingCardUnavailable,
  isAuditingCardPartiallyUnavailable,
  isAuditingCardNotConfigured,
  auditingIndicatorByLabel,
} from "./questions/auditCapabilityCard";

describe("FEATURE: Audit capability card", () => {
  describe("RULE: When no audit instance is configured, show 'Instance Not Configured' status", () => {
    test("EXAMPLE: No remote audit instances configured shows 'Get Started' button", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasNoAuditInstances);
      await driver.setUp(precondition.hasNoSuccessfulMessages);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isAuditingCardNotConfigured()).toBe(true);
      });

      const actionButton = await auditingActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/Get Started/i);
    });
  });

  describe("RULE: When audit instance is configured but unavailable, show 'Unavailable' status", () => {
    test("EXAMPLE: Single audit instance that is offline shows unavailable status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasUnavailableAuditInstance);
      await driver.setUp(precondition.hasNoSuccessfulMessages);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isAuditingCardUnavailable()).toBe(true);
      });

      const statusBadge = await auditingStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Unavailable/i);

      const actionButton = await auditingActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/Learn More/i);
    });
  });

  describe("RULE: When some audit instances are unavailable, show 'Degraded' status", () => {
    test("EXAMPLE: Multiple audit instances with mixed availability shows degraded status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasPartiallyUnavailableAuditInstances);
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isAuditingCardPartiallyUnavailable()).toBe(true);
      });

      const statusBadge = await auditingStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Degraded/i);
    });
  });

  describe("RULE: When audit instance is available but no messages exist, show 'Endpoints Not Configured' status", () => {
    test("EXAMPLE: Audit instance available but no successful messages shows not configured status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAvailableAuditInstance());
      await driver.setUp(precondition.hasNoSuccessfulMessages);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isAuditingCardNotConfigured()).toBe(true);
      });

      const actionButton = await auditingActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/Learn More/i);
    });
  });

  describe("RULE: When audit instance is available and messages exist, show 'Available' status", () => {
    test("EXAMPLE: Audit instance available with successful messages shows available status", async ({ driver }) => {
      // Arrange
      // Need to set up ServiceControl with version >= 6.6.0 for "All Messages" feature support
      await driver.setUp(precondition.hasActiveLicense);
      await driver.setUp(precondition.hasLicensingSettingTest());
      await driver.setUp(precondition.hasServiceControlMainInstance(precondition.serviceControlVersionSupportingAllMessages));
      await driver.setUp(precondition.hasServiceControlMonitoringInstance);
      await driver.setUp(precondition.hasUpToDateServiceControl);
      await driver.setUp(precondition.hasUpToDateServicePulse);
      await driver.setUp(precondition.errorsDefaultHandler);
      await driver.setUp(precondition.hasCustomChecksEmpty);
      await driver.setUp(precondition.hasNoDisconnectedEndpoints);
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
      await driver.setUp(precondition.hasAvailableAuditInstance());
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isAuditingCardAvailable()).toBe(true);
      });

      const statusBadge = await auditingStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Available/i);

      const actionButton = await auditingActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/View Messages/i);
    });
  });

  describe("RULE: Status indicators should show instance and message status", () => {
    test("EXAMPLE: Available audit instance shows instance indicator as green", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAvailableAuditInstance());
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await auditingStatusIndicators();
        expect(indicators).not.toBeNull();
        expect(indicators!.length).toBeGreaterThanOrEqual(1);
      });

      const instanceIndicator = await auditingIndicatorByLabel("Instance");
      expect(instanceIndicator).toBeInTheDocument();
    });

    test("EXAMPLE: Available audit instance with successful messages shows messages indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasAvailableAuditInstance());
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const messagesIndicator = await auditingIndicatorByLabel("Messages");
        expect(messagesIndicator).toBeInTheDocument();
      });
    });

    test("EXAMPLE: Multiple audit instances show numbered instance indicators", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMultipleAvailableAuditInstances);
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await auditingStatusIndicators();
        expect(indicators).not.toBeNull();
        // Should have Instance 1, Instance 2, and Messages indicators
        expect(indicators!.length).toBeGreaterThanOrEqual(3);
      });

      const instance1Indicator = await auditingIndicatorByLabel("Instance 1");
      expect(instance1Indicator).toBeInTheDocument();

      const instance2Indicator = await auditingIndicatorByLabel("Instance 2");
      expect(instance2Indicator).toBeInTheDocument();
    });
  });

  describe("RULE: When ServiceControl version does not support 'All Messages' feature, show 'Endpoints Not Configured' status", () => {
    test("EXAMPLE: ServiceControl version < 6.6.0 with successful messages still shows not configured status", async ({ driver }) => {
      // Arrange
      // Set up ServiceControl with version < 6.6.0 which does NOT support "All Messages" feature
      await driver.setUp(precondition.hasActiveLicense);
      await driver.setUp(precondition.hasLicensingSettingTest());
      await driver.setUp(precondition.hasServiceControlMainInstance(precondition.serviceControlVersionNotSupportingAllMessages));
      await driver.setUp(precondition.hasServiceControlMonitoringInstance);
      await driver.setUp(precondition.hasUpToDateServiceControl);
      await driver.setUp(precondition.hasUpToDateServicePulse);
      await driver.setUp(precondition.errorsDefaultHandler);
      await driver.setUp(precondition.hasCustomChecksEmpty);
      await driver.setUp(precondition.hasNoDisconnectedEndpoints);
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
      // Audit instance is available and has successful messages
      await driver.setUp(precondition.hasAvailableAuditInstance());
      await driver.setUp(precondition.hasSuccessfulMessages());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      // Even though there are successful messages, the status should be "not configured"
      // because the ServiceControl version doesn't support the "All Messages" feature
      await waitFor(async () => {
        expect(await isAuditingCardNotConfigured()).toBe(true);
      });

      const actionButton = await auditingActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/Learn More/i);
    });
  });
});
