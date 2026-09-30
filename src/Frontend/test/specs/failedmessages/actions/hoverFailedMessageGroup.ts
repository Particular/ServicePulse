import userEvent from "@testing-library/user-event";
import { getFailedMessageGroupRow } from "../questions/failedMessageGroupRows";

export async function hoverFailedMessageGroup(groupTitle: string): Promise<void> {
  const row = getFailedMessageGroupRow(groupTitle);
  if (!row) {
    throw new Error(`Failed message group "${groupTitle}" is not displayed`);
  }
  await userEvent.hover(row.element);
}
