import { screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { getRedirectDialog } from "../questions/redirectDialog";

export async function openCreateRedirectDialog(): Promise<HTMLElement> {
  const createRedirectButton = await screen.findByRole("button", { name: /create redirect/i });
  await userEvent.click(createRedirectButton);
  return getRedirectDialog("create");
}
