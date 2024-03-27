import { screen, within } from "@testing-library/vue";

export function endpointsGroupsNames() {
  const groups = screen.queryAllByRole("group");
  return groups.map((group) => group.getAttribute("aria-labelledby") || group.getAttribute("aria-label"));
}
