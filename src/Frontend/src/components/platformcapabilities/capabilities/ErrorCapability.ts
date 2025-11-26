import { computed } from "vue";
import { storeToRefs } from "pinia";
import { StatusIndicator } from "@/components/platformcapabilities/types";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";

const ErrorDescriptions: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]: "The ServiceControl Error instance is connected but no failed messages have been received yet. This may be because no failures have occurred, or recoverability is not configured.",
  [CapabilityStatus.Available]: "The ServiceControl Error instance is available and has received failed messages.",
};

const ErrorHelpButtonText: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]: "Learn More",
  [CapabilityStatus.Available]: "View Failed Messages",
};

const ErrorHelpButtonUrl: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]: "https://docs.particular.net/nservicebus/recoverability/",
  [CapabilityStatus.Available]: "#/failed-messages",
};

enum ErrorIndicatorTooltip {
  InstanceAvailable = "The ServiceControl Error instance is configured and available",
  InstanceUnavailable = "The ServiceControl Error instance is not responding",
  FailedMessagesAvailable = "Failed messages have been received and are available for management",
  FailedMessagesUnavailable = "No failed messages have been received yet",
}

export function useErrorCapability(): CapabilityComposable {
  const { getIconForStatus, getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus, createIndicator } = useCapabilityBase();

  // This tells us the connection state to the ServiceControl Error instance
  // and the failed message count. Auto refreshed every 5 seconds.
  const connectionsStore = useConnectionsAndStatsStore();
  const connectionState = connectionsStore.connectionState;
  const { failedMessageCount } = storeToRefs(connectionsStore);

  // Determine if there are any failed messages
  const hasFailedMessages = computed(() => failedMessageCount.value > 0);

  // Determine overall error status
  const errorStatus = computed(() => {
    const connectionSuccessful = connectionState.connected && !connectionState.unableToConnect;

    // 1. Check if we are connected to the error instance
    if (!connectionSuccessful) {
      return CapabilityStatus.Unavailable;
    }

    // 2. Check if there are any failed messages
    if (!hasFailedMessages.value) {
      return CapabilityStatus.EndpointsNotConfigured;
    }

    // 3. If connected and has failed messages, the error instance is fully available
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

    const connectionSuccessful = connectionState.connected && !connectionState.unableToConnect;
    const instanceTooltip = connectionSuccessful ? ErrorIndicatorTooltip.InstanceAvailable : ErrorIndicatorTooltip.InstanceUnavailable;

    indicators.push(createIndicator("Instance", connectionSuccessful ? CapabilityStatus.Available : CapabilityStatus.Unavailable, instanceTooltip));

    // Only show failed messages indicator if instance is connected
    if (connectionSuccessful) {
      const messagesIndicatorTooltip = hasFailedMessages.value ? ErrorIndicatorTooltip.FailedMessagesAvailable : ErrorIndicatorTooltip.FailedMessagesUnavailable;
      indicators.push(createIndicator("Failed Messages", hasFailedMessages.value ? CapabilityStatus.Available : CapabilityStatus.EndpointsNotConfigured, messagesIndicatorTooltip));
    }

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
