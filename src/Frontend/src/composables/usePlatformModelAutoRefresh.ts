import { useStoreAutoRefresh } from "./useAutoRefresh";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

export default useStoreAutoRefresh("platformModel", usePlatformModelStore, 5000).autoRefresh;
