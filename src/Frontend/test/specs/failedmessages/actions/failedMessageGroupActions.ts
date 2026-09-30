import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/vue";
import { getFailedMessageGroupRow } from "../questions/failedMessageGroupRows";
import { getConfirmationDialog } from "../questions/failedMessageGroupsView";

export async function clickGroupAction(groupTitle: string, action: RegExp): Promise<void> {
  const row = getFailedMessageGroupRow(groupTitle);
  if (!row) {
    throw new Error(`Cannot click ${action}: no failed message group row titled "${groupTitle}" is listed`);
  }
  await userEvent.click(within(row.element).getByRole("button", { name: action }));
}

export async function confirmDialog(heading: RegExp): Promise<void> {
  await userEvent.click(within(getConfirmationDialog(heading)).getByRole("button", { name: "Yes" }));
}

async function openMenu(label: string): Promise<HTMLElement> {
  const menu = screen.getByText(label).closest<HTMLElement>(".msg-group-menu");
  const toggle = menu?.querySelector<HTMLButtonElement>("button.dropdown-toggle");
  if (!menu || !toggle) {
    throw new Error(`Cannot open menu: the '${label}' menu is not shown`);
  }
  await userEvent.click(toggle);
  return menu;
}

export async function selectGrouping(classifier: string): Promise<void> {
  const menu = await openMenu("Group by:");
  await userEvent.click(within(menu).getByText(classifier, { selector: "a" }));
}

export async function selectSort(sortOption: RegExp): Promise<void> {
  const menu = await openMenu("Sort by:");
  await userEvent.click(within(menu).getByRole("button", { name: sortOption }));
}
