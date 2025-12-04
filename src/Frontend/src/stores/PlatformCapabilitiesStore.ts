import { acceptHMRUpdate, defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "servicepulse-platform-capabilities-visibility";

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
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
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
