import { screen, within } from "@testing-library/vue";

export async function endpointStaleWarning() {
  const staleWarning = await screen.queryByRole("status", { name: "stale-warning" });
  return staleWarning;
}

export async function negativeCriticalTimeWarning() {
  const criticalTimeWarning = await screen.queryByRole("status", { name: "negative-critical-time-warning" });
  return criticalTimeWarning;
}

export async function endpointDisconnectedWarning() {
  const staleWarning = await screen.queryByRole("status", { name: "disconnected-warning" });
  return staleWarning;
}

export async function endpointErrorCountWarning() {
  const staleWarning = await screen.queryByRole("status", { name: "error-count-warning" });
  return staleWarning;
}

export async function endpointErrorCount() {
  const staleWarning = await screen.queryByRole("status", { name: "error-count-warning" });
  if (staleWarning === null) return null;
  const errorCount = await within(staleWarning).findByLabelText("error-count");
  return errorCount.textContent;
}
