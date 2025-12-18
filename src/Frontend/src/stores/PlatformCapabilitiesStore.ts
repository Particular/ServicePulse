import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";
import serviceControlClient from "@/components/serviceControlClient";

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

interface PlatformCapabilitiesVisibility {
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
  const visibility = ref<PlatformCapabilitiesVisibility>(loadVisibility());

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
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePlatformCapabilitiesStore, import.meta.hot));
}

export type PlatformCapabilitiesStore = ReturnType<typeof usePlatformCapabilitiesStore>;
