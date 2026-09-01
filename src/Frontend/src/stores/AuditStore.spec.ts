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

function abortablePendingFetch(onSignal?: (signal: AbortSignal | undefined) => void) {
  return (_suffix: string, signal?: AbortSignal) =>
    new Promise((_resolve, reject) => {
      onSignal?.(signal);
      signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    });
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

  test("a new query aborts the one still in flight and keeps the newer result", async () => {
    const store = useAuditStore();

    let firstSignal: AbortSignal | undefined;
    fetchTypedFromServiceControl.mockImplementationOnce(abortablePendingFetch((signal) => (firstSignal = signal)));

    const first = store.refresh();

    const newerMessage = { id: "msg-2" };
    fetchTypedFromServiceControl.mockResolvedValueOnce([responseWithTotalCount(1), [newerMessage]]);
    await store.refresh();
    await first;

    expect(firstSignal?.aborted).toBe(true);
    expect(store.messages).toEqual([newerMessage]);
    expect(store.queryFailed).toBe(false);
  });

  test("cancelQuery aborts the query in flight without reporting a failure", async () => {
    const store = useAuditStore();

    let signal: AbortSignal | undefined;
    fetchTypedFromServiceControl.mockImplementationOnce(abortablePendingFetch((s) => (signal = s)));

    const inFlight = store.refresh();
    store.cancelQuery();
    await inFlight;

    expect(signal?.aborted).toBe(true);
    expect(store.queryFailed).toBe(false);
  });

  test("a superseded query is not reported as a failure", async () => {
    const store = useAuditStore();

    fetchTypedFromServiceControl.mockImplementationOnce(abortablePendingFetch());

    const first = store.refresh();

    fetchTypedFromServiceControl.mockResolvedValueOnce([responseWithTotalCount(0), []]);
    await store.refresh();
    await first;

    expect(store.queryFailed).toBe(false);
  });
});
