import { screen } from "@testing-library/vue";

export async function endpointStaleWarning() {
  const staleWarning = await screen.queryByRole("status", { name: "stale-warning" });
  return staleWarning;
}
