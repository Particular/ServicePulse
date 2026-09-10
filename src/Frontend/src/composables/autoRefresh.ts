import { watch, ref, computed, shallowReadonly, type Ref, type WatchStopHandle } from "vue";
import { useCounter, useDocumentVisibility, useTimeoutPoll } from "@vueuse/core";

export default function useFetchWithAutoRefresh(_name: string, fetchFn: () => Promise<void>, intervalMs: number) {
  let watchStop: WatchStopHandle | null = null;
  const { count, inc, dec, reset } = useCounter(0);
  const interval = ref(intervalMs);
  const inflight = ref(0);
  const refreshPending = ref(false);
  const isRefreshing = computed(() => inflight.value > 0);
  // When auto-refresh is active, the moment (epoch ms) the next poll tick is due; null while inactive
  const nextRefreshAt = ref<number | null>(null);

  const run = async () => {
    inflight.value++;
    try {
      await fetchFn();
    } finally {
      inflight.value--;
    }

    if (inflight.value === 0 && refreshPending.value) {
      // A poll tick landed while this fetch was running: the results were awaited, now honor the tick
      refreshPending.value = false;
      await run();
    }
  };

  // Poll path: a tick that lands while a fetch is already running must not cancel it —
  // it marks a refresh as pending, which runs as soon as the current fetch completes
  const fetchWrapper = async () => {
    if (inflight.value > 0) {
      refreshPending.value = true;
    } else {
      await run();
    }

    if (isActive.value) {
      nextRefreshAt.value = Date.now() + interval.value;
    }
  };

  // User path: never dropped — the fetchFn is expected to supersede its own in-flight work
  const refreshNow = run;
  const { isActive, pause, resume } = useTimeoutPoll(
    fetchWrapper,
    interval,
    { immediate: false, immediateCallback: true } // we control first fetch manually
  );

  const visibility = useDocumentVisibility();

  const pausePolling = () => {
    pause();
    nextRefreshAt.value = null;
  };

  const start = async () => {
    inc();
    if (count.value === 1) {
      resume();
      watchStop = watch(visibility, (current, previous) => {
        if (current === "visible" && previous === "hidden") {
          resume();
        }

        if (current === "hidden" && previous === "visible") {
          pausePolling();
        }
      });
    } else {
      // Because another component has started using the auto-refresh, do an immediate refresh to ensure it has up-to-date data
      await fetchWrapper();
    }
  };

  const stop = () => {
    dec();
    if (count.value <= 0) {
      pausePolling();
      watchStop?.();
      watchStop = null;
      reset();
    }
  };

  const updateInterval = (newIntervalMs: number) => {
    if (interval.value === newIntervalMs) return;

    interval.value = newIntervalMs;

    if (isActive.value) {
      // We need to do this hack, because useTimeoutPoll doesn't react to interval changes while active
      pause();
      resume();
    }
  };

  return { refreshNow, isRefreshing: isRefreshing as Readonly<Ref<boolean>>, updateInterval, isActive, start, stop, nextRefreshAt: shallowReadonly(nextRefreshAt) };
}
