export default function useAutoRefresh(refreshAction: () => Promise<void>, timeout: number) {
  let refreshInterval: number | null = null;

  function stopTimer() {
    if (refreshInterval !== null) {
      clearTimeout(refreshInterval);
      refreshInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    refreshInterval = window.setTimeout(() => {
      executeAndResetTimer();
    }, timeout);
  }

  async function executeAndResetTimer(overrideAction?: () => Promise<void>) {
    try {
      stopTimer();
      await (overrideAction ?? refreshAction)();
    } finally {
      startTimer();
    }
  }

  return {
    executeAndResetTimer,
  };
}
