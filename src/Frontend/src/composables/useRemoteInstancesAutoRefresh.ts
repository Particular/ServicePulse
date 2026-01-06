import { useRemoteInstancesStore } from "@/stores/RemoteInstancesStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

export default useStoreAutoRefresh("remoteInstances", useRemoteInstancesStore, 5000).autoRefresh;
