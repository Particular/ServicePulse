import { screen, within } from "@testing-library/vue";

/**
 * Gets the Recoverability capability card by looking for the title
 */
export async function recoverabilityCapabilityCard() {
  const cards = await screen.findAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Recoverability");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the Recoverability capability card synchronously (returns null if not found)
 */
export function recoverabilityCapabilityCardSync() {
  const cards = screen.queryAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Recoverability");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the status badge from the Recoverability capability card
 */
export async function recoverabilityStatusBadge() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return null;
  return within(card).queryByText(/Available|Unavailable|Degraded/);
}

/**
 * Gets the help/action button from the Recoverability capability card
 */
export async function recoverabilityActionButton() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return null;
  return within(card).queryByRole("button", { name: /Learn More|View Failed Messages/i });
}

/**
 * Gets the status indicators from the Recoverability capability card
 */
export async function recoverabilityStatusIndicators() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return null;
  return within(card).queryAllByTestId("status-indicator");
}

/**
 * Checks if the Recoverability card has the "available" styling (green border)
 */
export async function isRecoverabilityCardAvailable() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-available");
}

/**
 * Checks if the Recoverability card has the "unavailable" styling (red border)
 */
export async function isRecoverabilityCardUnavailable() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-unavailable");
}

/**
 * Checks if the Recoverability card has the "partially unavailable" / degraded styling (yellow border)
 */
export async function isRecoverabilityCardPartiallyUnavailable() {
  const card = await recoverabilityCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-partially-unavailable");
}

/**
 * Gets the indicator for a specific label (e.g., "Instance", "Primary")
 */
export async function recoverabilityIndicatorByLabel(label: string) {
  const indicators = await recoverabilityStatusIndicators();
  if (!indicators) return null;
  for (const indicator of indicators) {
    if (indicator.textContent?.includes(label)) {
      return indicator;
    }
  }
  return null;
}
