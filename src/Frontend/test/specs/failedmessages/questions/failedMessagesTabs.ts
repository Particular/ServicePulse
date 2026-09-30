import { within } from "@testing-library/vue";
import { normalise } from "./domText";

function tabHeader(tabName: string): HTMLElement | null {
  const tabs = document.querySelector<HTMLElement>(".tabs");
  if (!tabs) {
    return null;
  }
  const link = within(tabs).queryByRole("link", { name: new RegExp(`^${tabName}`, "i") });
  return link?.closest<HTMLElement>("h5") ?? null;
}

/** The badge text shown next to a Failed Messages tab, or null when no badge is shown. */
export function tabBadge(tabName: string): string | null {
  const badge = tabHeader(tabName)?.querySelector<HTMLElement>(".badge");
  return badge ? normalise(badge.textContent ?? "") : null;
}
