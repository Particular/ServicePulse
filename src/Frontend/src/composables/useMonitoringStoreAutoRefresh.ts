import { useMonitoringStore } from "@/stores/MonitoringStore";
import { useAutoRefresh } from "./useAutoRefresh";

let store: ReturnType<typeof useMonitoringStore> | null = null;

const refresh = () => {
  if (!store) {
    return Promise.resolve();
  }
  return store.checkForMonitoredEndpoints();
};

const autoRefresh = useAutoRefresh("monitoringStoreMonitoredEndpoints", refresh, 5000);

export default () => {
  store = useMonitoringStore();
  autoRefresh();
  return { store };
};
