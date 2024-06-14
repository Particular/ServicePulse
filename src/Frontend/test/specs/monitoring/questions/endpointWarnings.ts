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
  const disconnectedWarning = await screen.queryByRole("status", { name: "disconnected-warning" });
  return disconnectedWarning;
}

export async function endpointErrorCountWarning() {
  const errorCountWarning = await screen.queryByRole("status", { name: "error-count-warning" });
  return errorCountWarning;
}

export async function endpointErrorCount() {
  const errorCountWarning = await screen.queryByRole("status", { name: "error-count-warning" });
  if (errorCountWarning === null) return null;
  const errorCount = await within(errorCountWarning).findByLabelText("error-count");
  return errorCount.textContent;
}
