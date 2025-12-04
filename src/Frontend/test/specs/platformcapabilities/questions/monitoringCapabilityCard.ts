import { screen, within } from "@testing-library/vue";

/**
 * Gets the Monitoring capability card by looking for the title
 */
export async function monitoringCapabilityCard() {
  const cards = await screen.findAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Monitoring");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the Monitoring capability card synchronously (returns null if not found)
 */
export function monitoringCapabilityCardSync() {
  const cards = screen.queryAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Monitoring");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the status badge from the Monitoring capability card
 */
export async function monitoringStatusBadge() {
  const card = await monitoringCapabilityCard();
  if (!card) return null;
  return within(card).queryByText(/Available|Unavailable|Degraded/);
}

/**
 * Gets the help/action button from the Monitoring capability card
 */
export async function monitoringActionButton() {
  const card = await monitoringCapabilityCard();
  if (!card) return null;
  return within(card).queryByRole("button", { name: /Learn More|Get Started|View Metrics/i });
}

/**
 * Gets the status indicators from the Monitoring capability card
 */
export async function monitoringStatusIndicators() {
  const card = await monitoringCapabilityCard();
  if (!card) return null;
  return within(card).queryAllByTestId("status-indicator");
}

/**
 * Checks if the Monitoring card has the "available" styling (green border)
 */
export async function isMonitoringCardAvailable() {
  const card = await monitoringCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-available");
}

/**
 * Checks if the Monitoring card has the "unavailable" styling (red border)
 */
export async function isMonitoringCardUnavailable() {
  const card = await monitoringCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-unavailable");
}

/**
 * Checks if the Monitoring card has the "not configured" styling (blue gradient)
 */
export async function isMonitoringCardNotConfigured() {
  const card = await monitoringCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-notconfigured");
}

/**
 * Gets the indicator for a specific label (e.g., "Instance", "Metrics")
 */
export async function monitoringIndicatorByLabel(label: string) {
  const indicators = await monitoringStatusIndicators();
  if (!indicators) return null;
  for (const indicator of indicators) {
    if (indicator.textContent?.includes(label)) {
      return indicator;
    }
  }
  return null;
}
