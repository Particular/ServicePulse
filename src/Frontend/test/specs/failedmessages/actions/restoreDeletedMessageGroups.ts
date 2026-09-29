import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/vue";
import { getRestoreGroupConfirmation } from "../questions/deletedMessageGroupsView";
import { getDeletedMessageGroupRow } from "../questions/deletedMessageGroupRows";

export async function clickRestoreGroup(groupTitle: string): Promise<void> {
  const row = getDeletedMessageGroupRow(groupTitle);
  if (!row) {
    throw new Error(`Cannot restore: no deleted message group row titled "${groupTitle}" is listed`);
  }
  await userEvent.click(within(row.element).getByRole("button", { name: /restore group/i }));
}

export async function confirmRestoreGroup(): Promise<void> {
  await userEvent.click(within(getRestoreGroupConfirmation()).getByRole("button", { name: "Yes" }));
}

export async function declineRestoreGroup(): Promise<void> {
  await userEvent.click(within(getRestoreGroupConfirmation()).getByRole("button", { name: "No" }));
}

export async function restoreGroup(groupTitle: string): Promise<void> {
  await clickRestoreGroup(groupTitle);
  await confirmRestoreGroup();
}
