import { screen } from "@testing-library/vue";

const CONFIRMATION_NAME = /end the redirect/i;

export function getEndRedirectConfirmation(): HTMLElement {
  return screen.getByRole("dialog", { name: CONFIRMATION_NAME }) as HTMLElement;
}

export async function waitForEndRedirectConfirmation(): Promise<HTMLElement> {
  return (await screen.findByRole("dialog", { name: CONFIRMATION_NAME })) as HTMLElement;
}

export function isEndRedirectConfirmationVisible(): boolean {
  return screen.queryByRole("dialog", { name: CONFIRMATION_NAME }) !== null;
}
