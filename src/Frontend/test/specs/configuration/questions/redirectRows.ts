import { within } from "@testing-library/vue";

export interface RedirectRow {
  from: string;
  to: string;
  lastModifiedShown: boolean;
  element: HTMLElement;
}

function queryRedirectRows(): RedirectRow[] {
  return Array.from(document.querySelectorAll<HTMLElement>(".row.box.repeat-modify"))
    .map((element) => {
      const addresses = element.querySelectorAll<HTMLElement>("p.lead.hard-wrap.truncate");
      return {
        from: addresses[0]?.getAttribute("title") ?? "",
        to: addresses[1]?.getAttribute("title") ?? "",
        lastModifiedShown: /last modified/i.test(element.textContent ?? ""),
        element,
      };
    })
    .filter((row) => row.from !== "");
}

export function getRedirectRows(): RedirectRow[] {
  return queryRedirectRows();
}

export function getRedirectRow(fromAddress: string): RedirectRow | undefined {
  return queryRedirectRows().find((row) => row.from === fromAddress);
}

export function isRedirectListed(fromAddress: string, toAddress: string): boolean {
  return queryRedirectRows().some((row) => row.from === fromAddress && row.to === toAddress);
}

export function getRedirectRowCount(): number {
  return queryRedirectRows().length;
}

export function getRedirectRowActions(fromAddress: string) {
  const row = getRedirectRow(fromAddress);
  if (!row) {
    return undefined;
  }
  const inside = within(row.element);
  return {
    end: inside.getByRole("button", { name: /end redirect/i }),
    modify: inside.getByRole("button", { name: /modify redirect/i }),
  };
}
