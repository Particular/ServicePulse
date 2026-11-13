import { useTimeoutDetailsStore } from "@/stores/TimeoutDetailsStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

export default useStoreAutoRefresh("timeoutDetails", useTimeoutDetailsStore, 5000);
