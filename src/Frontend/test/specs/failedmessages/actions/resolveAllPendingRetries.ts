import userEvent from "@testing-library/user-event";
import { screen, within } from "@testing-library/vue";
import { getResolveAllConfirmation } from "../questions/pendingRetriesView";

export async function clickResolveAll(): Promise<void> {
  await userEvent.click(screen.getByRole("button", { name: /mark all as resolved/i }));
}

export async function confirmResolveAll(): Promise<void> {
  await userEvent.click(within(getResolveAllConfirmation()).getByRole("button", { name: "Yes" }));
}
