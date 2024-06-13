import { screen, within } from "@testing-library/vue";

export async function endpointsDetailsMessageName() {
  const messageName = await screen.findByRole("message-type-name", { name: "message-type-name" });
  screen.logTestingPlaygroundURL();
  return messageName.textContent;
}
