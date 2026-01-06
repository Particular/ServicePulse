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

export interface CapabilityCardHelpers {
  /** Gets the capability card by looking for the title (async, waits for element) */
  card: () => Promise<HTMLElement | null>;
  /** Gets the capability card synchronously (returns null if not found) */
  cardSync: () => HTMLElement | null;
  /** Gets the status badge from the capability card */
  statusBadge: () => Promise<HTMLElement | null>;
  /** Gets the help/action button from the capability card */
  actionButton: () => Promise<HTMLElement | null>;
  /** Gets the status indicators from the capability card */
  statusIndicators: () => Promise<HTMLElement[] | null>;
  /** Gets the description text from the capability card */
  description: () => Promise<string | null>;
  /** Gets the hide card button from the capability card */
  hideButton: () => Promise<HTMLElement | null>;
  /** Checks if the card is in loading state */
  isLoading: () => Promise<boolean>;
  /** Gets the loading text element */
  loadingText: () => HTMLElement | null;
  /** Checks if the card has the "available" styling (green border) */
  isAvailable: () => Promise<boolean>;
  /** Checks if the card has the "unavailable" styling (red border) */
  isUnavailable: () => Promise<boolean>;
  /** Checks if the card has the "partially unavailable" / degraded styling (yellow border) */
  isPartiallyUnavailable: () => Promise<boolean>;
  /** Checks if the card has the "not configured" styling (blue gradient) */
  isNotConfigured: () => Promise<boolean>;
  /** Gets the indicator for a specific label (e.g., "Instance", "Messages") */
  indicatorByLabel: (label: string) => Promise<HTMLElement | null>;
}

export interface CapabilityCardOptions {
  /** The title displayed on the card (e.g., "Auditing", "Monitoring") */
  title: string;
  /** Regex pattern to match the action button text */
  actionButtonPattern: RegExp;
  /** Regex pattern to match status badge text (defaults to Available|Unavailable|Degraded) */
  statusBadgePattern?: RegExp;
}

/**
 * Creates a set of helper functions for querying a specific capability card.
 * This factory reduces duplication across the different capability card test helpers.
 */
export function createCapabilityCardHelpers(options: CapabilityCardOptions): CapabilityCardHelpers {
  const { title, actionButtonPattern, statusBadgePattern = /Available|Unavailable|Degraded/ } = options;

  async function card(): Promise<HTMLElement | null> {
    const cards = await screen.findAllByTestId("capability-card");
    for (const c of cards) {
      const titleElement = within(c).queryByText(title);
      if (titleElement) {
        return c;
      }
    }
    return null;
  }

  function cardSync(): HTMLElement | null {
    const cards = screen.queryAllByTestId("capability-card");
    for (const c of cards) {
      const titleElement = within(c).queryByText(title);
      if (titleElement) {
        return c;
      }
    }
    return null;
  }

  async function statusBadge(): Promise<HTMLElement | null> {
    const c = await card();
    if (!c) return null;
    return within(c).queryByText(statusBadgePattern);
  }

  async function actionButton(): Promise<HTMLElement | null> {
    const c = await card();
    if (!c) return null;
    return within(c).queryByRole("button", { name: actionButtonPattern });
  }

  async function statusIndicators(): Promise<HTMLElement[] | null> {
    const c = await card();
    if (!c) return null;
    return within(c).queryAllByTestId("status-indicator");
  }

  async function description(): Promise<string | null> {
    const c = await card();
    if (!c) return null;
    const footer = c.querySelector(".capability-footer");
    if (!footer) return null;
    const desc = within(footer as HTMLElement).queryByText(/.+/);
    return desc?.textContent ?? null;
  }

  async function hideButton(): Promise<HTMLElement | null> {
    const c = await card();
    if (!c) return null;
    return within(c).queryByRole("button", { name: /hide this card/i }) || (c.querySelector(".hide-card-btn") as HTMLElement | null);
  }

  async function isLoading(): Promise<boolean> {
    const c = await card();
    if (!c) return false;
    return c.classList.contains("capability-loading");
  }

  function loadingText(): HTMLElement | null {
    return screen.queryByText(new RegExp(`Loading ${title} capability status`, "i"));
  }

  async function isAvailable(): Promise<boolean> {
    const c = await card();
    if (!c) return false;
    return c.classList.contains("capability-available");
  }

  async function isUnavailable(): Promise<boolean> {
    const c = await card();
    if (!c) return false;
    return c.classList.contains("capability-unavailable");
  }

  async function isPartiallyUnavailable(): Promise<boolean> {
    const c = await card();
    if (!c) return false;
    return c.classList.contains("capability-partially-unavailable");
  }

  async function isNotConfigured(): Promise<boolean> {
    const c = await card();
    if (!c) return false;
    return c.classList.contains("capability-notconfigured");
  }

  async function indicatorByLabel(label: string): Promise<HTMLElement | null> {
    const indicators = await statusIndicators();
    if (!indicators) return null;
    for (const indicator of indicators) {
      if (indicator.textContent?.includes(label)) {
        return indicator;
      }
    }
    return null;
  }

  return {
    card,
    cardSync,
    statusBadge,
    actionButton,
    statusIndicators,
    description,
    hideButton,
    isLoading,
    loadingText,
    isAvailable,
    isUnavailable,
    isPartiallyUnavailable,
    isNotConfigured,
    indicatorByLabel,
  };
}
