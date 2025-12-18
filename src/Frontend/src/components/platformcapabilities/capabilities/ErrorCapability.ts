import { computed } from "vue";
import { storeToRefs } from "pinia";
import { StatusIndicator } from "@/components/platformcapabilities/types";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";
import serviceControlClient from "@/components/serviceControlClient";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import routeLinks from "@/router/routeLinks";

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

enum ErrorIndicatorTooltip {
  InstanceAvailable = "The ServiceControl instance is configured and available",
  InstanceUnavailable = "The ServiceControl instance is not responding",
}

export function useErrorCapability(): CapabilityComposable {
  const { getIconForStatus, getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus, createIndicator } = useCapabilityBase();

  // This tells us the connection state to the ServiceControl instance.
  // Auto refreshed every 5 seconds.
  const connectionsStore = useConnectionsAndStatsStore();
  const connectionState = connectionsStore.connectionState;

  // This gives us version information for the ServiceControl instance
  const environmentStore = useEnvironmentAndVersionsStore();
  const { environment } = storeToRefs(environmentStore);

  // Check if instance is connected
  const isConnected = computed(() => connectionState.connected && !connectionState.unableToConnect);

  // Determine overall error status
  const errorStatus = computed(() => {
    if (!isConnected.value) {
      return CapabilityStatus.Unavailable;
    }
    return CapabilityStatus.Available;
  });

  // Icon based on status
  const errorIcon = computed(() => getIconForStatus(errorStatus.value));

  // Determine description based on status
  const errorDescription = computed(() => getDescriptionForStatus(errorStatus.value, ErrorDescriptions));

  // Determine help button text based on status
  const errorHelpButtonText = computed(() => getHelpButtonTextForStatus(errorStatus.value, ErrorHelpButtonText));

  // Determine help button URL based on status
  const errorHelpButtonUrl = computed(() => getHelpButtonUrlForStatus(errorStatus.value, ErrorHelpButtonUrl));

  // Determine indicators
  const errorIndicators = computed(() => {
    const indicators: StatusIndicator[] = [];

    const tooltip = isConnected.value ? ErrorIndicatorTooltip.InstanceAvailable : ErrorIndicatorTooltip.InstanceUnavailable;
    indicators.push(createIndicator("Instance", isConnected.value ? CapabilityStatus.Available : CapabilityStatus.Unavailable, tooltip, serviceControlClient.url, environment.value.sc_version));

    return indicators;
  });

  // Loading state - error is loading if we haven't attempted connection yet
  const isLoading = computed(() => !connectionState.connected && !connectionState.unableToConnect && connectionState.connecting);

  return {
    status: errorStatus,
    icon: errorIcon,
    description: errorDescription,
    indicators: errorIndicators,
    isLoading,
    helpButtonText: errorHelpButtonText,
    helpButtonUrl: errorHelpButtonUrl,
  };
}
