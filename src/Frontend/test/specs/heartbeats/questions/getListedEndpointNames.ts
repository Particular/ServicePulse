import { screen, within } from "@testing-library/vue";

export function getListedEndpointNames(): string[] {
  const endpointRowgroup = screen.queryByRole("rowgroup", { name: "endpoints" });

  if (!endpointRowgroup) {
    return [];
  }

  return within(endpointRowgroup)
    .queryAllByRole("row")
    .map((row) => within(row).getByRole("link", { name: "details-link" }).textContent ?? "");
}
