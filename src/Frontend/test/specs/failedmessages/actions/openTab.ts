import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/vue";

export async function openTab(tabName: string): Promise<void> {
  const tab = await screen.findByRole("link", { name: new RegExp(tabName, "i") });
  await userEvent.click(tab);
}
