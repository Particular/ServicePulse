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

// ServiceControl identifies an instance by its API URL, lower-cased and base64 encoded with the
// URL-safe alphabet ('-' for '+', '_' for '/', '.' for '=': InstanceIdGenerator.FromApiUrl).
// Returns the URL, or null when the id is not one of those.
export function decodeInstanceId(instanceId: string): string | null {
  if (instanceId === "") return null;
  try {
    const binary = atob(instanceId.replace(/-/g, "+").replace(/_/g, "/").replace(/\./g, "="));
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    const url = new URL(decoded);
    return url.protocol === "http:" || url.protocol === "https:" ? decoded : null;
  } catch {
    return null;
  }
}

export interface InstanceDescription {
  // What a reader needs to tell instances apart: host and port (default port omitted)
  label: string;
  // The full API URL for a tooltip, when the id decoded to one
  apiUrl: string | null;
}

export function describeInstance(instanceId: string): InstanceDescription {
  const apiUrl = decodeInstanceId(instanceId);
  if (apiUrl === null) return { label: instanceId, apiUrl: null };
  // URL.host already omits the port when it is the scheme's default
  return { label: new URL(apiUrl).host, apiUrl };
}
