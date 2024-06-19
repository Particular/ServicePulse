import { screen, within } from "@testing-library/vue";

export function endpointGroup(groupName: RegExp | string) {
  const group = screen.getByRole("row", { name: groupName });
  const { getAllByRole } = within(group);
  const items = getAllByRole("row");
  const endpointNames = items.map((item) => item.getAttribute("aria-labelledby") || item.getAttribute("aria-label"));
  return {
    Endpoints: endpointNames,
  };
}
