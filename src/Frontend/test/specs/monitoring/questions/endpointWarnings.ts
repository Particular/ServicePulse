import { screen, within } from "@testing-library/vue";

export function endpointStaleWarning() {
  const staleWarning = screen.queryByRole("status", { name: "stale-warning" });
  return staleWarning;
}

export function negativeCriticalTimeWarning() {
  const criticalTimeWarning = screen.queryByRole("status", { name: "negative-critical-time-warning" });
  return criticalTimeWarning;
}

export function endpointDisconnectedWarning() {
  const disconnectedWarning = screen.queryByRole("status", { name: "disconnected-warning" });
  return disconnectedWarning;
}

export function endpointErrorCountWarning() {
  const errorCountWarning = screen.queryByRole("status", { name: "error-count-warning" });
  return errorCountWarning;
}

export function endpointErrorCount() {
  const errorCountWarning = screen.queryByRole("status", { name: "error-count-warning" });
  if (errorCountWarning === null) return null;
  const errorCount = within(errorCountWarning).queryByLabelText("error-count");
  return errorCount?.textContent;
}
