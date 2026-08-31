import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const { fetchTypedFromServiceControl } = vi.hoisted(() => ({
  fetchTypedFromServiceControl: vi.fn(),
}));

vi.mock("@/components/serviceControlClient", () => ({
  default: {
    fetchTypedFromServiceControl,
  },
}));

import { useAuditStore } from "@/stores/AuditStore";

function responseWithTotalCount(count: number): Response {
  return { headers: new Headers({ "total-count": count.toString() }) } as Response;
}

const message = { id: "msg-1" };

describe("AuditStore refresh", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  test("a successful query populates the messages and total count", async () => {
    fetchTypedFromServiceControl.mockResolvedValue([responseWithTotalCount(1), [message]]);
    const store = useAuditStore();

    await store.refresh();

    expect(store.messages).toEqual([message]);
    expect(store.totalCount).toBe(1);
    expect(store.queryFailed).toBe(false);
  });

  test("a failed query flags the failure instead of throwing", async () => {
    fetchTypedFromServiceControl.mockRejectedValue(new Error("Internal Server Error"));
    const store = useAuditStore();

    await expect(store.refresh()).resolves.toBeUndefined();

    expect(store.messages).toEqual([]);
    expect(store.totalCount).toBe(0);
    expect(store.queryFailed).toBe(true);
  });

  test("a successful query clears an earlier failure", async () => {
    const store = useAuditStore();

    fetchTypedFromServiceControl.mockRejectedValueOnce(new Error("Internal Server Error"));
    await store.refresh();
    expect(store.queryFailed).toBe(true);

    fetchTypedFromServiceControl.mockResolvedValue([responseWithTotalCount(1), [message]]);
    await store.refresh();

    expect(store.queryFailed).toBe(false);
    expect(store.messages).toEqual([message]);
  });
});
