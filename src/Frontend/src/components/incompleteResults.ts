// Parsing for the X-Particular-Incomplete-Results response header.
//
// ServiceControl's composite (scatter-gather) endpoints return a bare array,
// so when an instance contributes nothing the response stays 200 with the
// partial data and this header names what is missing, as comma-separated
// "instanceId:reason" entries (reasons: timeout, unavailable, error).
// A response without the header is complete.

export type IncompleteReason = "timeout" | "unavailable" | "error";

export interface IncompleteInstance {
  instanceId: string;
  reason: IncompleteReason;
}

export const incompleteResultsHeader = "X-Particular-Incomplete-Results";

const knownReasons: ReadonlySet<string> = new Set(["timeout", "unavailable", "error"]);

export function parseIncompleteResults(header: string | null): IncompleteInstance[] {
  if (!header) return [];
  return header
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "")
    .map((entry) => {
      // The reason follows the last colon; instance ids can contain colons (e.g. URLs)
      const separator = entry.lastIndexOf(":");
      const instanceId = separator > 0 ? entry.slice(0, separator) : entry;
      const rawReason = separator > 0 ? entry.slice(separator + 1).trim() : "";
      const reason: IncompleteReason = knownReasons.has(rawReason) ? (rawReason as IncompleteReason) : "error";
      return { instanceId, reason };
    });
}

export function describeIncompleteReason(reason: IncompleteReason): string {
  switch (reason) {
    case "timeout":
      return "timed out";
    case "unavailable":
      return "unreachable";
    default:
      return "returned an error";
  }
}
