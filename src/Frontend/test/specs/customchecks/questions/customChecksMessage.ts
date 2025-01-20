import { screen } from "@testing-library/vue";

export async function customChecksMessage() {
  const txtMessage = await screen.findByRole("heading", { name: "customcheck-message" });
  return txtMessage.innerHTML;
}
