import { usePlatformCapabilitiesStore } from "@/stores/PlatformCapabilitiesStore";
import { useStoreAutoRefresh } from "./useAutoRefresh";

export default useStoreAutoRefresh("platformCapabilities", usePlatformCapabilitiesStore, 5000).autoRefresh;
