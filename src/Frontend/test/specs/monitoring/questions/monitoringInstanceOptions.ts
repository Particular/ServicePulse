import { screen, within } from "@testing-library/vue";
import { openMonitoringInstanceOptions } from "../actions/openMonitoringInstanceOptions";

export async function monitoringInstanceOptions() {
  await openMonitoringInstanceOptions();
  const list = await screen.findByRole("list", { name: /Monitoring instances:/i });
  const items = await within(list).findAllByRole("link");
  return items.map((item) => item.ariaLabel);
}
