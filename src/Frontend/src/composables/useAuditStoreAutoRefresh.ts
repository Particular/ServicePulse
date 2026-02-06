import { useAuditStore } from "@/stores/AuditStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

// Override the refresh method to use checkForSuccessfulMessages, which is more lightweight
const useAuditStoreWithRefresh = () => {
  const store = useAuditStore();
  return Object.assign(store, { refresh: store.checkForSuccessfulMessages });
};

export default useStoreAutoRefresh("auditStoreSuccessfulMessages", useAuditStoreWithRefresh, 5000).autoRefresh;
