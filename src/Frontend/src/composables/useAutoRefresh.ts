import { getCurrentInstance, onMounted, onUnmounted } from "vue";
import useFetchWithAutoRefresh from "./autoRefresh";

function useAutoRefresh(name: string, refresh: () => Promise<void>, intervalMs: number) {
  const { start, stop, isRefreshing, updateInterval } = useFetchWithAutoRefresh(name, refresh, intervalMs);

  function useAutoRefresh() {
    if (!getCurrentInstance()) return; //should only happen in some test contexts. Refresh will need to be called manually for those cases
    onMounted(start);
    onUnmounted(stop);
  }

  return { refresh: useAutoRefresh, isRefreshing, updateInterval };
}

/**
 * Creates a singleton auto-refresh composable for a Pinia store.
 * This handles the timing issue where the store needs to be called within a component lifecycle
 * but the auto-refresh manager needs to be a singleton.
 *
 * @param name - Name for logging purposes
 * @param useStore - Function that returns the Pinia store (called within component lifecycle)
 * @param intervalMs - Refresh interval in milliseconds
 * @returns A composable function that sets up auto-refresh and returns the store. Also provides a method to update the refresh interval and a ref indicating when a refresh is happening
 */
export function useStoreAutoRefresh<TStore extends { refresh: () => Promise<void> }>(name: string, useStore: () => TStore, intervalMs: number) {
  const refresh = () => {
    if (!store) {
      return Promise.resolve();
    }
    return store.refresh();
  };
  let store: TStore | null = null;
  const { refresh: autoRefresh, isRefreshing, updateInterval } = useAutoRefresh(name, refresh, intervalMs);

  return {
    autoRefresh: () => {
      store = useStore();
      autoRefresh();
      return { store };
    },
    isRefreshing,
    updateInterval,
  };
}
