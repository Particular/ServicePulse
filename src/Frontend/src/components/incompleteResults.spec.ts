import { describe, expect, test } from "vitest";
import { describeIncompleteReason, parseIncompleteResults } from "@/components/incompleteResults";

describe("FEATURE: Incomplete-results header parsing", () => {
  test("EXAMPLE: A missing header means the response is complete", () => {
    expect(parseIncompleteResults(null)).toEqual([]);
    expect(parseIncompleteResults("")).toEqual([]);
  });

  test("EXAMPLE: Entries carry the instance and why it contributed nothing", () => {
    expect(parseIncompleteResults("audit-2:timeout, audit-3:unavailable, audit-4:error")).toEqual([
      { instanceId: "audit-2", reason: "timeout" },
      { instanceId: "audit-3", reason: "unavailable" },
      { instanceId: "audit-4", reason: "error" },
    ]);
  });

  test("EXAMPLE: The reason follows the last colon, so instance ids can contain colons", () => {
    expect(parseIncompleteResults("http://audit-host:44444/api:timeout")).toEqual([{ instanceId: "http://audit-host:44444/api", reason: "timeout" }]);
  });

  test("EXAMPLE: An unknown reason is treated as an error", () => {
    expect(parseIncompleteResults("audit-2:exploded")).toEqual([{ instanceId: "audit-2", reason: "error" }]);
    expect(parseIncompleteResults("audit-2")).toEqual([{ instanceId: "audit-2", reason: "error" }]);
  });

  test("EXAMPLE: Reasons read as prose", () => {
    expect(describeIncompleteReason("timeout")).toBe("timed out");
    expect(describeIncompleteReason("unavailable")).toBe("unreachable");
    expect(describeIncompleteReason("error")).toBe("returned an error");
  });
});
