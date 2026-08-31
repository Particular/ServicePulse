import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import { recoverabilityCapabilityCard, recoverabilityStatusBadge, recoverabilityActionButton, recoverabilityStatusIndicators, isRecoverabilityCardAvailable, recoverabilityIndicatorByLabel } from "./questions/recoverabilityCapabilityCard";

// NOTE: The Recoverability card has two states: Available and Unavailable.
// However, the Unavailable state cannot be tested because when ServiceControl
// is unavailable, the entire dashboard is replaced with a connection error view.
// The recoverability card only displays when ServiceControl is connected.

describe("FEATURE: Recoverability capability card", () => {
  describe("RULE: When ServiceControl instance is available, show 'Available' status", () => {
    test("EXAMPLE: Instance available shows available status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isRecoverabilityCardAvailable()).toBe(true);
      });

      const statusBadge = await recoverabilityStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Available/i);

      const actionButton = await recoverabilityActionButton();
      expect(actionButton).toBeInTheDocument();
      expect(actionButton?.textContent).toMatch(/View Failed Messages/i);
    });
  });

  describe("RULE: Recoverability card shows capability-specific failure management guidance", () => {
    test("EXAMPLE: Connected primary shows a green FailedMessages indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasNoAuditInstances);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await recoverabilityStatusIndicators();
        expect(indicators).toHaveLength(1);
      });

      const failedMessagesIndicator = await recoverabilityIndicatorByLabel("FailedMessages");
      expect(failedMessagesIndicator).toBeInTheDocument();
      expect(failedMessagesIndicator?.textContent).toContain("FailedMessages");
      expect(failedMessagesIndicator?.querySelector(".light-success")).not.toBeNull();
    });

    test("EXAMPLE: Remote error instances do not change the green FailedMessages indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasRemoteErrorInstance);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isRecoverabilityCardAvailable()).toBe(true);
      });

      const failedMessagesIndicator = await recoverabilityIndicatorByLabel("FailedMessages");
      expect(failedMessagesIndicator).toBeInTheDocument();
      expect(failedMessagesIndicator?.querySelector(".light-success")).not.toBeNull();
    });

    test("EXAMPLE: Degraded primary instance still shows available status while connected", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasServiceControlPrimaryDegraded);

      await driver.goTo("/");

      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isRecoverabilityCardAvailable()).toBe(true);
      });

      const statusBadge = await recoverabilityStatusBadge();
      expect(statusBadge?.textContent).toMatch(/Available/i);

      const failedMessagesIndicator = await recoverabilityIndicatorByLabel("FailedMessages");
      expect(failedMessagesIndicator).toBeInTheDocument();
      expect(failedMessagesIndicator?.querySelector(".light-success")).not.toBeNull();
    });
  });
});
