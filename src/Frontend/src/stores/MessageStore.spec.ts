import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { ref } from "vue";
import { HttpError } from "@/utils/HttpError";

const { fetchFromServiceControl, fetchTypedFromServiceControl } = vi.hoisted(() => ({
  fetchFromServiceControl: vi.fn(),
  fetchTypedFromServiceControl: vi.fn(),
}));
const logger = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    fetchFromServiceControl,
    fetchTypedFromServiceControl,
  },
}));
vi.mock("@/logger", () => ({
  default: logger,
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
    logger.warn.mockReset();
    logger.error.mockReset();

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

  test("does not load edit/config during store creation", () => {
    useMessageStore();

    expect(fetchTypedFromServiceControl).not.toHaveBeenCalledWith("edit/config");
  });

  test.each([
    ["id\\with\\backslash", "id%5Cwith%5Cbackslash"],
    ["id/with/slash", "id%2Fwith%2Fslash"],
  ])("loadMessage encodes message ID %s", async (messageId, encodedMessageId) => {
    const store = useMessageStore();

    await store.loadMessage(messageId, "message-instance-id");

    expect(fetchTypedFromServiceControl).toHaveBeenCalledWith(`messages/search/${encodedMessageId}`);
  });

  test("logs a warning when edit/config fails with a non-403 error", async () => {
    fetchTypedFromServiceControl.mockImplementation((suffix: string) => {
      if (suffix === "edit/config") {
        return Promise.reject(new Error("boom"));
      }

      return Promise.resolve([{} as Response, []]);
    });

    const store = useMessageStore();
    await store.ensureEditAndRetryConfigurationLoaded();
    await vi.waitFor(() => {
      expect(fetchTypedFromServiceControl).toHaveBeenCalledWith("edit/config");
      expect(logger.warn).toHaveBeenCalledWith("Failed to load Edit and Retry configuration");
    });
  });

  test("does not log a warning when edit/config returns 403", async () => {
    fetchTypedFromServiceControl.mockImplementation((suffix: string) => {
      if (suffix === "edit/config") {
        return Promise.reject(new HttpError(403));
      }

      return Promise.resolve([{} as Response, []]);
    });

    const store = useMessageStore();
    await store.ensureEditAndRetryConfigurationLoaded();
    await vi.waitFor(() => {
      expect(fetchTypedFromServiceControl).toHaveBeenCalledWith("edit/config");
    });

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
