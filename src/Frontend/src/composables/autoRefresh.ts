import { ref } from "vue";

/**
 * Enables refresh functionality, either auto or manual
 * @param refreshAction The action to perform (by default) when refreshing
 * @param defaultTimeout The time between refreshes in ms or null if no auto-refresh is desired
 */
export default function useAutoRefresh(refreshAction: () => Promise<void>, defaultTimeout: number | null, startImmediately = true) {
  let refreshInterval: number | null = null;
  const timeout = ref(defaultTimeout);

  function stopTimer() {
    if (refreshInterval !== null) {
      window?.clearTimeout(refreshInterval);
      refreshInterval = null;
    }
  }

  function startTimer() {
    if (timeout.value === null) return;

    stopTimer();
    refreshInterval = window?.setTimeout(() => {
      executeAndResetTimer();
    }, timeout.value as number);
  }

  async function executeAndResetTimer(overrideAction?: () => Promise<void>) {
    try {
      stopTimer();
      await (overrideAction ?? refreshAction)();
    } finally {
      startTimer();
    }
  }

  /**
   * Updates the timeout interval between refreshes
   * @param updatedTimeout The new time between refreshes in ms or null if no auto-refresh is desired
   */
  async function updateTimeout(updatedTimeout: number) {
    timeout.value = updatedTimeout;
    await executeAndResetTimer();
  }

  // eslint-disable-next-line promise/catch-or-return,promise/prefer-await-to-then,promise/valid-params
  if (startImmediately) executeAndResetTimer().then();

  return {
    executeAndResetTimer,
    updateTimeout,
  };
}
