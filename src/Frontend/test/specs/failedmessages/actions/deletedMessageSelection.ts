import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/vue";

function toolbar(): HTMLElement {
  const element = document.querySelector<HTMLElement>(".btn-toolbar");
  if (!element) {
    throw new Error("The deleted messages toolbar is not displayed");
  }
  return element;
}

export async function selectAllDeletedMessages(): Promise<void> {
  await userEvent.click(within(toolbar()).getByRole("button", { name: /^select all$/i }));
}

export async function clearDeletedMessageSelection(): Promise<void> {
  await userEvent.click(within(toolbar()).getByRole("button", { name: /clear selection/i }));
}

export async function selectDeletedMessage(messageId: string): Promise<void> {
  const checkbox = document.querySelector<HTMLInputElement>(`#checkbox${messageId}`);
  if (!checkbox) {
    throw new Error(`Deleted message ${messageId} is not displayed`);
  }
  await userEvent.click(checkbox);
}
