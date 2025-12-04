import { screen, within } from "@testing-library/vue";

/**
 * Gets the platform capabilities section element
 */
export function platformCapabilitiesSection() {
  return screen.queryByText("Platform Capabilities")?.closest(".platform-capabilities");
}

/**
 * Gets the collapsed platform capabilities button
 */
export function platformCapabilitiesCollapsedButton() {
  return screen.queryByRole("button", { name: /show platform capabilities/i });
}

/**
 * Gets all capability cards on the page
 */
export function allCapabilityCards() {
  return screen.queryAllByTestId("capability-card");
}

/**
 * Gets the Auditing capability card by looking for the title
 */
export async function auditingCapabilityCard() {
  const cards = await screen.findAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Auditing");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the Auditing capability card synchronously (returns null if not found)
 */
export function auditingCapabilityCardSync() {
  const cards = screen.queryAllByTestId("capability-card");
  for (const card of cards) {
    const title = within(card).queryByText("Auditing");
    if (title) {
      return card;
    }
  }
  return null;
}

/**
 * Gets the status badge from the Auditing capability card
 */
export async function auditingStatusBadge() {
  const card = await auditingCapabilityCard();
  if (!card) return null;
  return within(card).queryByText(/Available|Unavailable|Degraded/);
}

/**
 * Gets the description text from the Auditing capability card
 */
export async function auditingDescription() {
  const card = await auditingCapabilityCard();
  if (!card) return null;
  const footer = card.querySelector(".capability-footer");
  if (!footer) return null;
  const description = within(footer as HTMLElement).queryByText(/.+/);
  return description?.textContent;
}

/**
 * Gets the help/action button from the Auditing capability card
 */
export async function auditingActionButton() {
  const card = await auditingCapabilityCard();
  if (!card) return null;
  return within(card).queryByRole("button", { name: /Learn More|Get Started|View Messages/i });
}

/**
 * Gets the status indicators from the Auditing capability card
 */
export async function auditingStatusIndicators() {
  const card = await auditingCapabilityCard();
  if (!card) return null;
  return within(card).queryAllByTestId("status-indicator");
}

/**
 * Checks if the Auditing card is in loading state
 */
export async function isAuditingCardLoading() {
  const card = await auditingCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-loading");
}

/**
 * Gets the loading text from the Auditing capability card
 */
export function auditingLoadingText() {
  return screen.queryByText(/Loading Auditing capability status/i);
}

/**
 * Checks if the Auditing card has the "available" styling (green border)
 */
export async function isAuditingCardAvailable() {
  const card = await auditingCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-available");
}

/**
 * Checks if the Auditing card has the "unavailable" styling (red border)
 */
export async function isAuditingCardUnavailable() {
  const card = await auditingCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-unavailable");
}

/**
 * Checks if the Auditing card has the "partially unavailable" / degraded styling (yellow border)
 */
export async function isAuditingCardPartiallyUnavailable() {
  const card = await auditingCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-partially-unavailable");
}

/**
 * Checks if the Auditing card has the "not configured" styling (blue gradient)
 */
export async function isAuditingCardNotConfigured() {
  const card = await auditingCapabilityCard();
  if (!card) return false;
  return card.classList.contains("capability-notconfigured");
}

/**
 * Gets the hide card button from the Auditing capability card
 */
export async function auditingHideButton() {
  const card = await auditingCapabilityCard();
  if (!card) return null;
  return within(card).queryByRole("button", { name: /hide this card/i }) || card.querySelector(".hide-card-btn");
}

/**
 * Gets the indicator for a specific label (e.g., "Instance", "Messages")
 */
export async function auditingIndicatorByLabel(label: string) {
  const indicators = await auditingStatusIndicators();
  if (!indicators) return null;
  for (const indicator of indicators) {
    if (indicator.textContent?.includes(label)) {
      return indicator;
    }
  }
  return null;
}
