import { useTimeoutCountsStore } from "@/stores/TimeoutCountsStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

export default useStoreAutoRefresh("timeoutCounts", useTimeoutCountsStore, 5000).autoRefresh;
