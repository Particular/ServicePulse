import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import serviceControlClient from "@/components/serviceControlClient";
import auditClient from "@/components/audit/auditClient";
import monitoringClient from "@/components/monitoring/monitoringClient";
import useConnectionsAndStatsAutoRefresh from "@/composables/useConnectionsAndStatsAutoRefresh";

const STORAGE_KEY_PREFIX = "servicepulse-capabilities-vis";

function getStorageKey(): string {
  const url = serviceControlClient.url;
  if (url) {
    // Create a simple hash of the URL to keep the key reasonably short
    const hash = url.split("").reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0);
    return `${STORAGE_KEY_PREFIX}-${Math.abs(hash).toString(36)}`;
  }
  return STORAGE_KEY_PREFIX;
}

export interface PlatformCapabilitiesVisibility {
  showSection: boolean;
  showAuditingCard: boolean;
  showMonitoringCard: boolean;
  showErrorCard: boolean;
}

const defaultVisibility: PlatformCapabilitiesVisibility = {
  showSection: true,
  showAuditingCard: true,
  showMonitoringCard: true,
  showErrorCard: true,
};

function loadVisibility(): PlatformCapabilitiesVisibility {
  try {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<PlatformCapabilitiesVisibility>;
      return { ...defaultVisibility, ...parsed };
    }
  } catch {
    // Ignore parse errors, use defaults
  }
  return { ...defaultVisibility };
}

function saveVisibility(visibility: PlatformCapabilitiesVisibility): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(visibility));
  } catch {
    // Ignore storage errors
  }
}

export const usePlatformCapabilitiesStore = defineStore("PlatformCapabilitiesStore", () => {
  const { store: connectionStore } = useConnectionsAndStatsAutoRefresh();
  const visibility = ref<PlatformCapabilitiesVisibility>(loadVisibility());
  const hasSuccessfulMessages = ref(false);
  const hasMonitoredEndpoints = ref(false);

  async function checkForSuccessfulMessages() {
    try {
      hasSuccessfulMessages.value = await auditClient.hasSuccessfulMessages();
    } catch {
      hasSuccessfulMessages.value = false;
    }
  }

  async function checkForMonitoredEndpoints() {
    try {
      if (!monitoringClient.isMonitoringEnabled || connectionStore.monitoringConnectionState.unableToConnect) {
        hasMonitoredEndpoints.value = false;
        return;
      }
      // Minimal query: just need to check if any endpoints exist
      const data = await monitoringClient.getMonitoredEndpoints(1);
      hasMonitoredEndpoints.value = (data?.length ?? 0) > 0;
    } catch {
      hasMonitoredEndpoints.value = false;
    }
  }

  async function refresh() {
    await Promise.all([checkForSuccessfulMessages(), checkForMonitoredEndpoints()]);
  }

  // Watch for changes and persist to localStorage
  watch(
    visibility,
    (newValue) => {
      saveVisibility(newValue);
    },
    { deep: true }
  );

  function toggleSection() {
    visibility.value.showSection = !visibility.value.showSection;
  }

  function toggleAuditingCard() {
    visibility.value.showAuditingCard = !visibility.value.showAuditingCard;
  }

  function toggleMonitoringCard() {
    visibility.value.showMonitoringCard = !visibility.value.showMonitoringCard;
  }

  function toggleErrorCard() {
    visibility.value.showErrorCard = !visibility.value.showErrorCard;
  }

  function showAll() {
    visibility.value.showSection = true;
    visibility.value.showAuditingCard = true;
    visibility.value.showMonitoringCard = true;
    visibility.value.showErrorCard = true;
  }

  return {
    visibility,
    toggleSection,
    toggleAuditingCard,
    toggleMonitoringCard,
    toggleErrorCard,
    showAll,
    hasSuccessfulMessages,
    hasMonitoredEndpoints,
    refresh,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformCapabilitiesStore, import.meta.hot));
}

export type PlatformCapabilitiesStore = ReturnType<typeof usePlatformCapabilitiesStore>;
