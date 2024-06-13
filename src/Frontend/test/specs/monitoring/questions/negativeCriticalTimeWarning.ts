import { screen, within } from "@testing-library/vue";

export async function negativeCriticalTimeWarning() {
  const criticalTimeWarning = await screen.queryByRole("status", { name: "negative-critical-time-warning" });
  return criticalTimeWarning;
}
