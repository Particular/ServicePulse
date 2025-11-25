import { useAuditStore } from "@/stores/AuditStore";
import { useAutoRefresh } from "./useAutoRefresh";

let store: ReturnType<typeof useAuditStore> | null = null;

const refresh = () => {
  if (!store) {
    return Promise.resolve();
  }
  return store.checkForSuccessfulMessages();
};

const autoRefresh = useAutoRefresh("auditStoreSuccessfulMessages", refresh, 5000);

export default () => {
  store = useAuditStore();
  autoRefresh();
  return { store };
};
