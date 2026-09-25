import { within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { getRedirectRowActions } from "../questions/redirectRows";
import { waitForEndRedirectConfirmation } from "../questions/endRedirectConfirmation";

export async function requestToEndRedirect(fromAddress: string): Promise<HTMLElement> {
  const actions = getRedirectRowActions(fromAddress);
  if (!actions) {
    throw new Error(`Cannot end a redirect from "${fromAddress}" because it is not listed`);
  }

  await userEvent.click(actions.end);
  return waitForEndRedirectConfirmation();
}

export async function answerEndRedirectConfirmation(answer: boolean): Promise<void> {
  const confirmation = await waitForEndRedirectConfirmation();
  await userEvent.click(within(confirmation).getByRole("button", { name: answer ? "Yes" : "No" }));
}

export async function endRedirect(fromAddress: string): Promise<void> {
  await requestToEndRedirect(fromAddress);
  await answerEndRedirectConfirmation(true);
}

export async function declineToEndRedirect(fromAddress: string): Promise<void> {
  await requestToEndRedirect(fromAddress);
  await answerEndRedirectConfirmation(false);
}
