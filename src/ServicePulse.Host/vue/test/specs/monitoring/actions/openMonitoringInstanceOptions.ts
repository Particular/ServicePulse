import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/vue";

export async function openMonitoringInstanceOptions() {
  await userEvent.click(await screen.findByRole("button", { name: /monitoring-instance-btn/i }));
}
