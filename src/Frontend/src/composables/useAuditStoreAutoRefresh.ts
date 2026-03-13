import { useAuditStore } from "@/stores/AuditStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

// Use checkForSuccessfulMessages for auto-refresh (lightweight) via customRefresh
// instead of mutating the store's refresh method, which would break AuditList's full fetch
export default useStoreAutoRefresh("auditStoreSuccessfulMessages", useAuditStore, 5000, (store) => store.checkForSuccessfulMessages()).autoRefresh;
