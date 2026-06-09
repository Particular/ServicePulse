import { describe, expect, test, vi } from "vitest";
import { hasFailedMessage } from "./recoverability";
import type { Driver } from "../driver";

describe("recoverability preconditions", () => {
  test.each([
    ["id\\with\\backslash", "id%5Cwith%5Cbackslash"],
    ["id/with/slash", "id%2Fwith%2Fslash"],
  ])("hasFailedMessage encodes message ID %s in mocked endpoints", (messageId, encodedMessageId) => {
    window.defaultConfig = {
      ...window.defaultConfig,
      service_control_url: "http://localhost:33333/api/",
    } as typeof window.defaultConfig;

    const driver = {
      mockEndpoint: vi.fn(),
      mockEndpointDynamic: vi.fn(),
    } as unknown as Driver;

    hasFailedMessage({
      withGroupId: "message-instance-id",
      withMessageId: messageId,
      withContentType: "application/json",
      withBody: { key: "value" },
    })({ driver });

    expect(driver.mockEndpoint).toHaveBeenCalledWith(`http://localhost:33333/api/messages/${encodedMessageId}/body`, expect.any(Object));
    expect(driver.mockEndpoint).toHaveBeenCalledWith(`http://localhost:33333/api/messages/search/${encodedMessageId}`, expect.any(Object));
  });
});
