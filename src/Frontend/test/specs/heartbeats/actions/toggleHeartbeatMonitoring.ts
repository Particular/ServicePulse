import { screen, within } from "@testing-library/vue";
import { requestsSettled } from "../../../drivers/vitest/requestsInFlight";

export async function toggleHeartbeatMonitoring(instanceName: string) {
  const endpointRow = await screen.findByRole("row", { name: instanceName });

  (<HTMLInputElement>within(endpointRow).getByRole("switch")).click();
  await requestsSettled();
}
