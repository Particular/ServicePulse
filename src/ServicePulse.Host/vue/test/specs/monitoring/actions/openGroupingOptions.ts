import userEvent from "@testing-library/user-event";
import { fireEvent, screen } from "@testing-library/vue";

export async function openGroupingOptions() {
  await userEvent.click(await screen.findByRole("button", { name: /no grouping/i }));
}
