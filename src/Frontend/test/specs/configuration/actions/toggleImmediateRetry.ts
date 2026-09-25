import userEvent from "@testing-library/user-event";
import { getImmediateRetryCheckbox } from "../questions/redirectFormFields";

export async function toggleImmediateRetry(dialog: HTMLElement): Promise<void> {
  await userEvent.click(getImmediateRetryCheckbox(dialog));
}

export async function setImmediateRetry(dialog: HTMLElement, shouldRetry: boolean): Promise<void> {
  const checkbox = getImmediateRetryCheckbox(dialog);
  if (checkbox.checked !== shouldRetry) {
    await userEvent.click(checkbox);
  }
}
