import { vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

let inFlight = 0;
let settledWaiters: (() => void)[] = [];

export function trackRequestsInFlight() {
  const untrackedFetch = globalThis.fetch;
  globalThis.fetch = async (...args: Parameters<typeof fetch>) => {
    inFlight++;
    try {
      return await untrackedFetch(...args);
    } finally {
      inFlight--;
      if (inFlight === 0) {
        settledWaiters.forEach((resolve) => resolve());
        settledWaiters = [];
      }
    }
  };
}

export async function requestsSettled() {
  await flushPromises();
  while (inFlight > 0) {
    await new Promise<void>((resolve) => settledWaiters.push(resolve));
    await flushPromises();
  }
}

// A request still in flight when the next test starts can escape MSW to the real network: https://github.com/mswjs/interceptors/issues/897
export async function settleRequestsAfterTest() {
  if (vi.isFakeTimers()) {
    await vi.advanceTimersByTimeAsync(0);
    vi.useRealTimers();
  }
  await requestsSettled();
}
