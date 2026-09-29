import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/vue";
import { normalise } from "../questions/domText";

function dropdownMenu(): HTMLElement {
  const toggle = document.querySelector<HTMLElement>(".msg-group-menu .btn.dropdown-toggle");
  if (toggle) {
    toggle.click(); //Bootstrap toggles the menu open; the option buttons live inside .dropdown-menu
  }
  const menu = document.querySelector<HTMLElement>(".msg-group-menu .dropdown-menu");
  if (!menu) {
    throw new Error("The sort-by dropdown is not displayed");
  }
  return menu;
}

function optionButton(description: string, descending: boolean): HTMLElement {
  const buttons = within(dropdownMenu()).getAllByRole("button");
  const match = buttons.find((button) => {
    const text = normalise(button.textContent ?? "");
    return descending ? text === `${description} (Descending)` : text === description;
  });
  if (!match) {
    throw new Error(`The '${descending ? `${description} (Descending)` : description}' sort option is not displayed`);
  }
  return match;
}

export async function sortBy(description: string): Promise<void> {
  await userEvent.click(optionButton(description, false));
}

export async function sortByDescending(description: string): Promise<void> {
  await userEvent.click(optionButton(description, true));
}
