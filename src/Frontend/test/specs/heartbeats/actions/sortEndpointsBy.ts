import { screen, within } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";

export async function sortEndpointsBy(columnName: string) {
  const columnHeader = await screen.findByRole("columnheader", { name: columnName });
  const sortButton = within(columnHeader).getByRole("button", { name: columnName });

  await UserEvent.click(sortButton);
}
