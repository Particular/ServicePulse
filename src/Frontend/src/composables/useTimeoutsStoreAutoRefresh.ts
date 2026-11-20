import { useTimeoutsStore } from "@/stores/TimeoutsStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

export default useStoreAutoRefresh("timeouts", useTimeoutsStore, 5000).autoRefresh;
