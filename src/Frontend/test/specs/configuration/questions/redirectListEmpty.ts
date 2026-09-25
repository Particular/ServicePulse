import { screen } from "@testing-library/vue";

function getEmptyMessage(): HTMLElement | null {
  const message = screen.queryByText(/there are currently no redirects/i);
  return message && message.getAttribute("role") === "status" ? (message as HTMLElement) : null;
}

export function isEmptyMessageVisible(): boolean {
  return getEmptyMessage() !== null;
}

export function isEmptyMessageText(): string | undefined {
  return getEmptyMessage()?.textContent?.trim();
}
