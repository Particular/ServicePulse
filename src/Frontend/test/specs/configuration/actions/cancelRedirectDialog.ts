import { within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";

export async function cancelRedirectDialog(dialog: HTMLElement): Promise<void> {
  await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
}
