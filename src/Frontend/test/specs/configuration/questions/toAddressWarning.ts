import { within } from "@testing-library/vue";

const UNKNOWN_TARGET = /target queue does not match any known queue/i;
const NO_KNOWN_QUEUES = /no known queues found/i;

export function getToAddressWarning(scope: HTMLElement): string | undefined {
  const warning = within(scope).queryByText(UNKNOWN_TARGET) ?? within(scope).queryByText(NO_KNOWN_QUEUES);
  return warning?.textContent?.trim();
}

export function isUnknownTargetQueueWarningVisible(scope: HTMLElement): boolean {
  return within(scope).queryByText(UNKNOWN_TARGET) !== null;
}

export function isNoKnownQueuesWarningVisible(scope: HTMLElement): boolean {
  return within(scope).queryByText(NO_KNOWN_QUEUES) !== null;
}
