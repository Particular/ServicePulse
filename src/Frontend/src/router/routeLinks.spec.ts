import { describe, expect, test } from "vitest";
import routeLinks from "./routeLinks";

describe("routeLinks", () => {
  test.each([
    ["id\\with\\backslash", "id%5Cwith%5Cbackslash"],
    ["id/with/slash", "id%2Fwith%2Fslash"],
  ])("successMessage link encodes message ID %s", (messageId, encodedMessageId) => {
    const link = routeLinks.messages.successMessage.link(messageId, "message-instance-id");

    expect(link).toBe(`/messages/${encodedMessageId}/message-instance-id`);
  });
});
