import userEvent from "@testing-library/user-event";
import { getSourceQueueControl } from "../questions/redirectFormFields";

export async function setSourceQueue(dialog: HTMLElement, queue: string): Promise<void> {
  await userEvent.selectOptions(getSourceQueueControl(dialog), queue);
}
