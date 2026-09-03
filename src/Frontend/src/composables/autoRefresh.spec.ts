import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import useFetchWithAutoRefresh from "@/composables/autoRefresh";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}

describe("useFetchWithAutoRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a poll tick during a running fetch does not cancel it, and refreshes once the results are in", async () => {
    const slowFetch = deferred();
    const fetchFn = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => Promise.resolve()) // initial poll fetch on start
      .mockImplementationOnce(() => slowFetch.promise) // the user-initiated long query
      .mockImplementation(() => Promise.resolve());

    const { refreshNow, start, isRefreshing } = useFetchWithAutoRefresh("test", fetchFn, 1000);

    await start();
    await flushPromises();
    expect(fetchFn).toHaveBeenCalledTimes(1);

    const userQuery = refreshNow();
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(isRefreshing.value).toBe(true);

    // The auto-refresh interval elapses while the user's query is still running
    await vi.advanceTimersByTimeAsync(1100);
    expect(fetchFn).toHaveBeenCalledTimes(2); // the running query was not disturbed

    slowFetch.resolve();
    await userQuery;
    await flushPromises();

    // The elapsed tick was honored once the results were in
    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(isRefreshing.value).toBe(false);
  });

  test("the next auto refresh time is exposed while polling and cleared when stopped", async () => {
    const fetchFn = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const { start, stop, nextRefreshAt } = useFetchWithAutoRefresh("test", fetchFn, 1000);

    expect(nextRefreshAt.value).toBeNull();

    await start();
    await flushPromises();

    expect(nextRefreshAt.value).not.toBeNull();
    expect(nextRefreshAt.value! - Date.now()).toBeGreaterThan(0);
    expect(nextRefreshAt.value! - Date.now()).toBeLessThanOrEqual(1000);

    stop();
    expect(nextRefreshAt.value).toBeNull();
  });

  test("a user-initiated refresh is never dropped while a fetch is running", async () => {
    const slowFetch = deferred();
    const fetchFn = vi
      .fn<() => Promise<void>>()
      .mockImplementationOnce(() => slowFetch.promise)
      .mockImplementation(() => Promise.resolve());

    const { refreshNow } = useFetchWithAutoRefresh("test", fetchFn, 0);

    const first = refreshNow();
    const second = refreshNow(); // e.g. the user changed a filter while the first query was running

    expect(fetchFn).toHaveBeenCalledTimes(2);

    slowFetch.resolve();
    await Promise.all([first, second]);
  });
});
