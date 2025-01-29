import { screen } from "@testing-library/vue";

export function customChecksMessage() {
  const customCheckNoDataMessage = screen.queryByRole("note", { name: "customcheck-message" });
  return customCheckNoDataMessage?.textContent?.trim();
}
export function customChecksMessageElement() {
  const customCheckNoDataElement = screen.queryByRole("note", { name: "customcheck-message" });
  return customCheckNoDataElement;
}
export function customChecksListElement() {
  const customChecksListElement = screen.queryByRole("table", { name: "custom-check-list" });
  return customChecksListElement;
}
export async function customChecksFailedRowsList() {
  const failedCustomChecksRows = await screen.findAllByRole("row", { name: "custom-check-failed-row" });
  return failedCustomChecksRows;
}
export async function customChecksFailedReasonList() {
  const failedCustomChecksReasons = await screen.findAllByRole("note", { name: "custom-check-failed-reason" });
  return failedCustomChecksReasons;
}
export function customChecksListPaginationElement() {
  const customChecksListPaginationElement = screen.queryByRole("row", { name: "custom-check-pagination" });
  return customChecksListPaginationElement;
}
