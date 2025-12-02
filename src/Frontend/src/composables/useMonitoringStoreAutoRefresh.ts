import { useMonitoringStore } from "@/stores/MonitoringStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

// Override the refresh method to use checkForMonitoredEndpoints, which is more lightweight
const useMonitoringStoreWithRefresh = () => {
  const store = useMonitoringStore();
  return Object.assign(store, { refresh: store.checkForMonitoredEndpoints });
};

export default useStoreAutoRefresh("monitoringStoreMonitoredEndpoints", useMonitoringStoreWithRefresh, 5000).autoRefresh;
