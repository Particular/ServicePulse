import { screen, within } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";
import type { HeartbeatsTab } from "../questions/getHeartbeatsTabCount";

const tabRegionName: Record<HeartbeatsTab, string> = {
  active: "Healthy Endpoints",
  inactive: "Unhealthy Endpoints",
};

export async function navigateToEndpointInstances(endpointName: string) {
  const endpointRow = await screen.findByRole("row", { name: endpointName });
  const detailsLink = within(endpointRow).getByRole("link", { name: "details-link" });

  await UserEvent.click(detailsLink);

  await screen.findByRole("heading", { name: `${endpointName} Instances` });
}

export async function navigateBackToEndpointList(tab: HeartbeatsTab) {
  const backLink = await screen.findByRole("link", { name: "Back" });

  await UserEvent.click(backLink);

  await screen.findByRole("region", { name: tabRegionName[tab] });
}
