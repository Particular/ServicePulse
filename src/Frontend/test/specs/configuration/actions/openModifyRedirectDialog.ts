import userEvent from "@testing-library/user-event";
import { getRedirectRowActions } from "../questions/redirectRows";
import { getRedirectDialog } from "../questions/redirectDialog";

export async function openModifyRedirectDialog(fromAddress: string): Promise<HTMLElement> {
  const actions = getRedirectRowActions(fromAddress);
  if (!actions) {
    throw new Error(`Cannot modify a redirect from "${fromAddress}" because it is not listed`);
  }

  await userEvent.click(actions.modify);
  return getRedirectDialog("modify");
}
