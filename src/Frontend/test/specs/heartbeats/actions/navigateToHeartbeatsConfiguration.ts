import { screen } from "@testing-library/vue";

export async function navigateToHeartbeatsConfiguration() {
  const heartbeatsMenuItem = await screen.findByRole("link", { name: "Heartbeats Menu Item" });
  heartbeatsMenuItem.click();

  const configurationTab = await screen.findByRole("tab", { name: "Configuration" });
  configurationTab.click();

  // Wait for the tab to switch
  await screen.findByRole("region", { name: "Endpoint Configuration" });
}
