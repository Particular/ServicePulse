import { useStoreAutoRefresh } from "./useAutoRefresh";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";

export default useStoreAutoRefresh("platformHealth", usePlatformHealthStore, 5000).autoRefresh;
