import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/vue";
import { getRetryAllConfirmation } from "../questions/pendingRetriesView";

export async function selectQueueFilter(queueAddress: string): Promise<void> {
  const queueSelect = await screen.findByRole("combobox");
  await userEvent.selectOptions(queueSelect, queueAddress);
}

export async function selectRetryPeriod(period: string): Promise<void> {
  const periodMenu = document.querySelector<HTMLElement>(".msg-group-menu .dropdown-menu");
  if (!periodMenu) {
    throw new Error("Period dropdown menu not found");
  }
  await userEvent.click(within(periodMenu).getByText(period));
}

export async function clickRetryAll(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /retry all/i }));
}

export async function confirmRetryAll(): Promise<void> {
  await userEvent.click(within(getRetryAllConfirmation()).getByRole("button", { name: "Yes" }));
}
