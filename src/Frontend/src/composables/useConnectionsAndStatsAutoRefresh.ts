import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { createStoreAutoRefresh } from "./useAutoRefresh";

export default createStoreAutoRefresh("connectionsAndStats", useConnectionsAndStatsStore, 5000);
