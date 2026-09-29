import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/vue";

function retryButton(messageId: string): HTMLElement {
  const row = document.querySelector(`.row.box.repeat-item.failed-message #checkbox${messageId}`)?.closest(".failed-message");
  const button = row?.querySelector<HTMLElement>('button[name="retryMessage"]');
  if (!button) {
    throw new Error(`The 'Request retry' action for failed message ${messageId} is not displayed`);
  }
  return button;
}

export async function requestRetryFor(messageId: string): Promise<void> {
  const button = retryButton(messageId);
  await userEvent.click(button);
}
