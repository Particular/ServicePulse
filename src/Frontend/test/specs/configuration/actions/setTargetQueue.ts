import userEvent from "@testing-library/user-event";
import { getTargetQueueControl } from "../questions/redirectFormFields";

export async function setTargetQueue(dialog: HTMLElement, address: string): Promise<void> {
  const targetQueue = getTargetQueueControl(dialog);
  await userEvent.clear(targetQueue);
  await userEvent.type(targetQueue, address);
}

export async function selectTargetQueueFromSuggestions(dialog: HTMLElement, address: string): Promise<void> {
  await setTargetQueue(dialog, address);

  const suggestion = Array.from(dialog.querySelectorAll(".simple-typeahead-list-item")).find((item) => item.textContent?.trim() === address);
  if (!suggestion) {
    throw new Error(`No typeahead suggestion for "${address}" was offered`);
  }

  await userEvent.click(suggestion);
}
