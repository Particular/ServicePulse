import { computed } from "vue";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import type { StatusIndicator } from "@/components/platformcapabilities/types";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";
import routeLinks from "@/router/routeLinks";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const ErrorDescriptions: CapabilityStatusToStringMap = {
  [CapabilityStatus.Unavailable]: "The ServiceControl instance is not responding.",
  [CapabilityStatus.Available]: "The ServiceControl instance is available.",
};

const ErrorHelpButtonText: CapabilityStatusToStringMap = {
  [CapabilityStatus.Available]: "View Failed Messages",
};

const ErrorHelpButtonUrl: CapabilityStatusToStringMap = {
  [CapabilityStatus.Unavailable]: "https://docs.particular.net/servicecontrol/troubleshooting",
  [CapabilityStatus.Available]: routeLinks.failedMessage.root,
};

export function useErrorCapability(): CapabilityComposable {
  const { getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus } = useCapabilityBase();
  const platformModelStore = usePlatformModelStore();

  // Check if instance is connected
  const isConnected = computed(() => platformModelStore.primary?.health !== "unavailable");

  // Determine overall error status
  const errorStatus = computed(() => {
    if (!isConnected.value) {
      return CapabilityStatus.Unavailable;
    }
    return CapabilityStatus.Available;
  });

  // Determine description based on status
  const errorDescription = computed(() => getDescriptionForStatus(errorStatus.value, ErrorDescriptions));

  // Determine help button text based on status
  const errorHelpButtonText = computed(() => getHelpButtonTextForStatus(errorStatus.value, ErrorHelpButtonText));

  // Determine help button URL based on status
  const errorHelpButtonUrl = computed(() => getHelpButtonUrlForStatus(errorStatus.value, ErrorHelpButtonUrl));

  const errorIndicators = computed<StatusIndicator[]>(() => []);

  // Loading state - error is loading if we haven't attempted connection yet
  const isLoading = computed(() => platformModelStore.model === null);

  return {
    status: errorStatus,
    description: errorDescription,
    indicators: errorIndicators,
    isLoading,
    helpButtonText: errorHelpButtonText,
    helpButtonUrl: errorHelpButtonUrl,
  };
}
