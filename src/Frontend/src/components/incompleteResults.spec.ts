import { describe, expect, test } from "vitest";
import { decodeInstanceId, describeIncompleteReason, describeInstance, parseIncompleteResults } from "@/components/incompleteResults";

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

  // ServiceControl identifies an instance by its API URL, lower-cased and base64 encoded with
  // the URL-safe alphabet: '-' for '+', '_' for '/', '.' for '=' (InstanceIdGenerator)
  describe("RULE: Instance ids are ServiceControl's base64 API URLs and are shown as host and port", () => {
    test("EXAMPLE: An id decodes to the instance's API URL", () => {
      expect(decodeInstanceId("aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv")).toBe("http://localhost:44444/api/");
    });

    test("EXAMPLE: URL-safe substitutions and dot padding are reversed before decoding", () => {
      expect(decodeInstanceId("aHR0cDovL3NjLWF1ZGl0OjQ0NDQ0L2FwaQ..")).toBe("http://sc-audit:44444/api");
    });

    test("EXAMPLE: Something that is not a base64 URL is left alone", () => {
      expect(decodeInstanceId("audit-2")).toBeNull();
      expect(decodeInstanceId("")).toBeNull();
    });

    test("EXAMPLE: The label is host and port; scheme and path are noise for a reader", () => {
      expect(describeInstance("aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv")).toEqual({ label: "localhost:44444", apiUrl: "http://localhost:44444/api/" });
      expect(describeInstance("aHR0cDovL2F1ZGl0LTIuaW50ZXJuYWw6MzMzMzMvYXBp")).toEqual({ label: "audit-2.internal:33333", apiUrl: "http://audit-2.internal:33333/api" });
    });

    test("EXAMPLE: A default port is omitted from the label", () => {
      expect(describeInstance("aHR0cHM6Ly9hdWRpdC5leGFtcGxlLmNvbS9hcGkv")).toEqual({ label: "audit.example.com", apiUrl: "https://audit.example.com/api/" });
    });

    test("EXAMPLE: An id that does not decode is shown as it is, with nothing to hover", () => {
      expect(describeInstance("audit-2")).toEqual({ label: "audit-2", apiUrl: null });
    });
  });
});
