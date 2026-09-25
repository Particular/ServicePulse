import { screen, within } from "@testing-library/vue";

export type RedirectDialogKind = "create" | "modify";

const headingFor: Record<RedirectDialogKind, RegExp> = {
  create: /create redirect/i,
  modify: /modify redirect/i,
};

export async function getRedirectDialog(kind: RedirectDialogKind): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", { name: headingFor[kind] });
  const container = heading.closest(".modal-container");
  if (!container) {
    throw new Error(`Could not find the .modal-container for the ${kind} redirect dialog`);
  }
  return container as HTMLElement;
}

export function queryRedirectDialog(kind: RedirectDialogKind): HTMLElement | null {
  const heading = screen.queryByRole("heading", { name: headingFor[kind] });
  return (heading?.closest(".modal-container") as HTMLElement) ?? null;
}

export function isRedirectDialogOpen(kind: RedirectDialogKind): boolean {
  return queryRedirectDialog(kind) !== null;
}

export function getSubmitButton(dialog: HTMLElement, kind: RedirectDialogKind) {
  return within(dialog).getByRole("button", { name: kind === "create" ? "Create" : "Modify" });
}
