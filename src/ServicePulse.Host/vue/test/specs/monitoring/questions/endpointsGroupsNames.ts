import { screen, within } from "@testing-library/vue";

export function endpointsGroupsNames() {
  const groups = screen.getAllByRole("group");    
  const groupNames = groups.map(group => group.getAttribute("aria-labelledby") || group.getAttribute("aria-label"));  
  return groupNames;
}
