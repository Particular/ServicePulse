import { test, describe } from "../../drivers/vitest/driver";
import { expect } from "vitest";
import * as precondition from "../../preconditions";
import { waitFor, screen } from "@testing-library/vue";
import { auditingCapabilityCard } from "./questions/auditCapabilityCard";
import { monitoringCapabilityCard } from "./questions/monitoringCapabilityCard";
import { recoverabilityCapabilityCard } from "./questions/recoverabilityCapabilityCard";

// Helper functions for visibility tests
function getPlatformCapabilitiesSection() {
  const element = screen.queryByText("Platform Capabilities")?.closest(".platform-capabilities");
  return element || null;
}

function getCollapsedSection() {
  const element = screen.queryByText("Show Platform Capabilities")?.closest(".platform-capabilities-collapsed");
  return element || null;
}

function getShowAllButton() {
  return screen.queryByRole("button", { name: /show all/i });
}

function getHideSectionButton() {
  const section = getPlatformCapabilitiesSection();
  if (!section) return null;
  return section.querySelector(".hide-section-btn");
}

function getHideCardButton(card: HTMLElement | null) {
  if (!card) return null;
  return card.querySelector(".hide-card-btn");
}

describe("FEATURE: Platform Capabilities visibility controls", () => {
  describe("RULE: Users can hide individual capability cards", () => {
    test("EXAMPLE: Clicking X button on Auditing card hides it", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert - Card is initially visible
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      // Get the hide button and click it
      const card = await auditingCapabilityCard();
      const hideButton = getHideCardButton(card);
      expect(hideButton).toBeInTheDocument();

      // Click the hide button
      (hideButton as HTMLButtonElement).click();

      // Assert - Card is now hidden
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeNull();
      });

      // Other cards should still be visible
      const monitoringCard = await monitoringCapabilityCard();
      expect(monitoringCard).toBeInTheDocument();

      const recoverabilityCard = await recoverabilityCapabilityCard();
      expect(recoverabilityCard).toBeInTheDocument();
    });

    test("EXAMPLE: Clicking X button on Monitoring card hides it", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert - Card is initially visible
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      // Get the hide button and click it
      const card = await monitoringCapabilityCard();
      const hideButton = getHideCardButton(card);
      expect(hideButton).toBeInTheDocument();

      // Click the hide button
      (hideButton as HTMLButtonElement).click();

      // Assert - Card is now hidden
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeNull();
      });

      // Other cards should still be visible
      const auditingCard = await auditingCapabilityCard();
      expect(auditingCard).toBeInTheDocument();

      const recoverabilityCard = await recoverabilityCapabilityCard();
      expect(recoverabilityCard).toBeInTheDocument();
    });

    test("EXAMPLE: Clicking X button on Recoverability card hides it", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert - Card is initially visible
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      // Get the hide button and click it
      const card = await recoverabilityCapabilityCard();
      const hideButton = getHideCardButton(card);
      expect(hideButton).toBeInTheDocument();

      // Click the hide button
      (hideButton as HTMLButtonElement).click();

      // Assert - Card is now hidden
      await waitFor(async () => {
        const card = await recoverabilityCapabilityCard();
        expect(card).toBeNull();
      });

      // Other cards should still be visible
      const auditingCard = await auditingCapabilityCard();
      expect(auditingCard).toBeInTheDocument();

      const monitoringCard = await monitoringCapabilityCard();
      expect(monitoringCard).toBeInTheDocument();
    });
  });

  describe("RULE: 'Show All' button appears when cards are hidden and restores them", () => {
    test("EXAMPLE: Show All button appears after hiding a card", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert - Show All button should NOT be visible initially
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      const showAllButton = getShowAllButton();
      expect(showAllButton).toBeNull();

      // Hide a card
      const card = await auditingCapabilityCard();
      const hideButton = getHideCardButton(card);
      (hideButton as HTMLButtonElement).click();

      // Assert - Show All button should now be visible
      await waitFor(() => {
        const button = getShowAllButton();
        expect(button).toBeInTheDocument();
      });
    });

    test("EXAMPLE: Clicking Show All restores all hidden cards", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Wait for cards to load
      await waitFor(async () => {
        const card = await auditingCapabilityCard();
        expect(card).toBeInTheDocument();
      });

      // Hide the auditing card
      const auditCard = await auditingCapabilityCard();
      let hideButton = getHideCardButton(auditCard);
      (hideButton as HTMLButtonElement).click();

      // Hide the monitoring card
      await waitFor(async () => {
        const card = await monitoringCapabilityCard();
        expect(card).toBeInTheDocument();
      });
      const monitorCard = await monitoringCapabilityCard();
      hideButton = getHideCardButton(monitorCard);
      (hideButton as HTMLButtonElement).click();

      // Assert - Both cards are hidden
      await waitFor(async () => {
        expect(await auditingCapabilityCard()).toBeNull();
        expect(await monitoringCapabilityCard()).toBeNull();
      });

      // Click Show All
      const showAllButton = getShowAllButton();
      expect(showAllButton).toBeInTheDocument();
      (showAllButton as HTMLButtonElement).click();

      // Assert - All cards are restored
      await waitFor(async () => {
        const audit = await auditingCapabilityCard();
        const monitoring = await monitoringCapabilityCard();
        const recoverability = await recoverabilityCapabilityCard();
        expect(audit).toBeInTheDocument();
        expect(monitoring).toBeInTheDocument();
        expect(recoverability).toBeInTheDocument();
      });

      // Show All button should be hidden again
      const buttonAfter = getShowAllButton();
      expect(buttonAfter).toBeNull();
    });
  });

  describe("RULE: Users can collapse and expand the entire Platform Capabilities section", () => {
    test("EXAMPLE: Clicking chevron button collapses the section", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Assert - Section is initially expanded
      await waitFor(() => {
        const section = getPlatformCapabilitiesSection();
        expect(section).toBeInTheDocument();
      });

      // Get the hide section button and click it
      const hideSectionButton = getHideSectionButton();
      expect(hideSectionButton).toBeInTheDocument();
      (hideSectionButton as HTMLButtonElement).click();

      // Assert - Section is now collapsed
      await waitFor(() => {
        const expandedSection = getPlatformCapabilitiesSection();
        expect(expandedSection).toBeNull();

        const collapsedSection = getCollapsedSection();
        expect(collapsedSection).toBeInTheDocument();
      });
    });

    test("EXAMPLE: Clicking 'Show Platform Capabilities' expands the collapsed section", async ({ driver }) => {
      // Arrange
      await driver.setUp(precondition.serviceControlWithMonitoring);

      // Act
      await driver.goTo("/");

      // Wait for section to load then collapse it
      await waitFor(() => {
        const section = getPlatformCapabilitiesSection();
        expect(section).toBeInTheDocument();
      });

      const hideSectionButton = getHideSectionButton();
      (hideSectionButton as HTMLButtonElement).click();

      // Wait for section to collapse
      await waitFor(() => {
        const collapsedSection = getCollapsedSection();
        expect(collapsedSection).toBeInTheDocument();
      });

      // Click the expand button
      const expandButton = screen.getByRole("button", { name: /show platform capabilities/i });
      expect(expandButton).toBeInTheDocument();
      expandButton.click();

      // Assert - Section is now expanded again
      await waitFor(async () => {
        const expandedSection = getPlatformCapabilitiesSection();
        expect(expandedSection).toBeInTheDocument();

        // All cards should be visible
        const audit = await auditingCapabilityCard();
        const monitoring = await monitoringCapabilityCard();
        const recoverability = await recoverabilityCapabilityCard();
        expect(audit).toBeInTheDocument();
        expect(monitoring).toBeInTheDocument();
        expect(recoverability).toBeInTheDocument();
      });
    });
  });
});
