import userEvent from "@testing-library/user-event";
import { getSubmitButton, type RedirectDialogKind } from "../questions/redirectDialog";

export async function submitRedirectDialog(dialog: HTMLElement, kind: RedirectDialogKind): Promise<void> {
  await userEvent.click(getSubmitButton(dialog, kind));
}
