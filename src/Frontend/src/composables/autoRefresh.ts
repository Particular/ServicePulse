import { watch, ref, shallowReadonly, type WatchStopHandle } from "vue";
import { useCounter, useDocumentVisibility, useTimeoutPoll } from "@vueuse/core";

export default function useFetchWithAutoRefresh(_name: string, fetchFn: () => Promise<void>, intervalMs: number) {
  let watchStop: WatchStopHandle | null = null;
  const { count, inc, dec, reset } = useCounter(0);
  const interval = ref(intervalMs);
  const isRefreshing = ref(false);
  const fetchWrapper = async () => {
    if (isRefreshing.value) {
      return;
    }
    isRefreshing.value = true;
    try {
      await fetchFn();
    } finally {
      isRefreshing.value = false;
    }
  };
  const { isActive, pause, resume } = useTimeoutPoll(
    fetchWrapper,
    interval,
    { immediate: false, immediateCallback: true } // we control first fetch manually
  );

  const visibility = useDocumentVisibility();

  const start = async () => {
    inc();
    if (count.value === 1) {
      resume();
      watchStop = watch(visibility, (current, previous) => {
        if (current === "visible" && previous === "hidden") {
          resume();
        }

        if (current === "hidden" && previous === "visible") {
          pause();
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
      pause();
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

  return { refreshNow: fetchWrapper, isRefreshing: shallowReadonly(isRefreshing), updateInterval, isActive, start, stop };
}
