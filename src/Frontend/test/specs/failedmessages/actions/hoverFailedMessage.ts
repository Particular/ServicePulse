import userEvent from "@testing-library/user-event";

function rowElement(messageId: string): HTMLElement {
  const row = document.querySelector(`.row.box.repeat-item.failed-message #checkbox${messageId}`)?.closest<HTMLElement>(".failed-message");
  if (!row) {
    throw new Error(`Failed message ${messageId} is not displayed`);
  }
  return row;
}

export async function hoverFailedMessage(messageId: string): Promise<void> {
  await userEvent.hover(rowElement(messageId));
}
