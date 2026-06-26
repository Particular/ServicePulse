import { describe, it, expect } from "vitest";
import { normalizeRouteKey } from "@/composables/routeMatching";

describe("normalizeRouteKey", () => {
  it.each([
    ["POST", "/api/errors/{id}/retry", "POST /api/errors/{}/retry"],
    ["post", "/api/errors/{failedMessageId}/retry", "POST /api/errors/{}/retry"], // param-name-insensitive + verb case
    ["GET", "/api/errors", "GET /api/errors"],
    ["DELETE", "/api/monitored-instance/{name}/{instanceId}", "DELETE /api/monitored-instance/{}/{}"],
    ["GET", "api/messages2", "GET /api/messages2"], // adds leading slash
  ])("normalizes %s %s", (method, path, expected) => {
    expect(normalizeRouteKey(method, path)).toBe(expected);
  });
});
