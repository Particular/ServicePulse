import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";

const { fetchFromServiceControl, fetchTypedFromServiceControl } = vi.hoisted(() => ({
  fetchFromServiceControl: vi.fn(),
  fetchTypedFromServiceControl: vi.fn(),
}));

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    fetchFromServiceControl,
    fetchTypedFromServiceControl,
  },
}));

vi.mock("@/composables/useEnvironmentAndVersionsAutoRefresh", () => ({
  default: () => ({
    store: {
      serviceControlIsGreaterThan: () => ref(true),
    },
  }),
}));

import { useMessageStore } from "@/stores/MessageStore";

describe("MessageStore tests", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    fetchFromServiceControl.mockResolvedValue({
      json: () => Promise.resolve({ data_retention: {} }),
    });
    fetchTypedFromServiceControl.mockImplementation((suffix: string) => {
      if (suffix === "edit/config") {
        return Promise.resolve([{} as Response, { enabled: false, locked_headers: [], sensitive_headers: [] }]);
      }

      return Promise.resolve([{} as Response, []]);
    });
  });

  test.each([
    ["id\\with\\backslash", "id%5Cwith%5Cbackslash"],
    ["id/with/slash", "id%2Fwith%2Fslash"],
  ])("loadMessage encodes message ID %s", async (messageId, encodedMessageId) => {
    const store = useMessageStore();

    await store.loadMessage(messageId, "message-instance-id");

    expect(fetchTypedFromServiceControl).toHaveBeenCalledWith(`messages/search/${encodedMessageId}`);
  });
});
