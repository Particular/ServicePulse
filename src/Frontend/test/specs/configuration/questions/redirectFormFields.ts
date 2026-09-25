import { within } from "@testing-library/vue";

export function getSourceQueueControl(dialog: HTMLElement) {
  return within(dialog).getByLabelText("From physical address");
}

export function getTargetQueueControl(dialog: HTMLElement) {
  return within(dialog).getByLabelText("To physical address");
}

export function getImmediateRetryCheckbox(dialog: HTMLElement): HTMLInputElement {
  return <HTMLInputElement>within(dialog).getByRole("checkbox", { name: /immediately retry any matching failed messages/i });
}
