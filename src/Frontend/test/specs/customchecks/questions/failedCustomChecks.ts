import { screen } from "@testing-library/vue";

export async function customChecksMessageElement() {
  const messageElement = await screen.findByRole("note", { name: "customcheck-message" });
  return messageElement;
}
export async function customChecksList() {
  const failedCustomChecksRows = await screen.findAllByRole("row", { name: "custom-check-failed-row" });
  return failedCustomChecksRows;
}
export async function customChecksFailedReasonList() {
  const failedCustomChecksReasons = await screen.findAllByRole("note", { name: "custom-check-failed-reason" });
  return failedCustomChecksReasons;
}
