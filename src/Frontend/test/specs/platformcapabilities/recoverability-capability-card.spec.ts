import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor } from "@testing-library/vue";
import {
  recoverabilityCapabilityCard,
  recoverabilityStatusBadge,
  recoverabilityActionButton,
  recoverabilityStatusIndicators,
  isRecoverabilityCardAvailable,
  isRecoverabilityCardPartiallyUnavailable,
  recoverabilityIndicatorByLabel,
} from "./questions/recoverabilityCapabilityCard";

describe("FEATURE: Recoverability capability card", () => {
  describe("RULE: When primary ServiceControl instance is available, show 'Available' status", () => {
    test("EXAMPLE: Primary instance available shows available status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasPrimaryErrorInstanceOnly);

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

  describe("RULE: When primary and secondary instances are available, show 'Available' status", () => {
    test("EXAMPLE: Primary and secondary error instances available shows available status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSecondaryErrorInstance());

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
    });
  });

  describe("RULE: When some instances are unavailable, show 'Degraded' status", () => {
    test("EXAMPLE: Primary available but secondary unavailable shows degraded status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSecondaryErrorInstanceUnavailable);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isRecoverabilityCardPartiallyUnavailable()).toBe(true);
      });

      const statusBadge = await recoverabilityStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Degraded/i);
    });

    test("EXAMPLE: Multiple secondary instances with mixed availability shows degraded status", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMultipleSecondaryErrorInstancesPartiallyUnavailable);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        expect(await isRecoverabilityCardPartiallyUnavailable()).toBe(true);
      });

      const statusBadge = await recoverabilityStatusBadge();
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge?.textContent).toMatch(/Degraded/i);
    });
  });

  describe("RULE: Status indicators should show instance status", () => {
    test("EXAMPLE: Single primary instance shows 'Instance' indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasPrimaryErrorInstanceOnly);

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await recoverabilityStatusIndicators();
        expect(indicators).not.toBeNull();
        expect(indicators!.length).toBeGreaterThanOrEqual(1);
      });

      const instanceIndicator = await recoverabilityIndicatorByLabel("Instance");
      expect(instanceIndicator).toBeInTheDocument();
    });

    test("EXAMPLE: Primary with secondary instances shows 'Primary' indicator", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasSecondaryErrorInstance());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const primaryIndicator = await recoverabilityIndicatorByLabel("Primary");
        expect(primaryIndicator).toBeInTheDocument();
      });
    });

    test("EXAMPLE: Multiple instances show numbered indicators", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.hasMultipleSecondaryErrorInstances());

      // Act
      await driver.goTo("/");

      // Assert
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      await waitFor(async () => {
        const indicators = await recoverabilityStatusIndicators();
        expect(indicators).not.toBeNull();
        // Should have Primary, Instance 2, Instance 3 indicators
        expect(indicators!.length).toBeGreaterThanOrEqual(3);
      });

      const primaryIndicator = await recoverabilityIndicatorByLabel("Primary");
      expect(primaryIndicator).toBeInTheDocument();

      const instance2Indicator = await recoverabilityIndicatorByLabel("Instance 2");
      expect(instance2Indicator).toBeInTheDocument();
    });
  });
});
