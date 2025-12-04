import { computed } from "vue";
import { storeToRefs } from "pinia";
import { StatusIndicator } from "@/components/platformcapabilities/types";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";
import useRemoteInstancesAutoRefresh from "@/composables/useRemoteInstancesAutoRefresh";
import { RemoteInstanceStatus, RemoteInstanceType, type RemoteInstance } from "@/resources/RemoteInstance";
import serviceControlClient from "@/components/serviceControlClient";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";

/**
 * Checks if a remote instance is an error/recoverability instance using the cached instance type
 */
function isErrorInstance(instance: RemoteInstance): boolean {
  return instance.cachedInstanceType === RemoteInstanceType.Error;
}

/**
 * Filters remote instances to only include error/recoverability instances
 */
function filterErrorInstances(instances: RemoteInstance[] | null | undefined): RemoteInstance[] {
  if (!instances) {
    return [];
  }
  return instances.filter(isErrorInstance);
}

/**
 * Checks if all error remote instances are unavailable
 */
function allErrorInstancesUnavailable(instances: RemoteInstance[]): boolean {
  if (instances.length === 0) {
    return false;
  }
  return instances.every((instance) => instance.status !== RemoteInstanceStatus.Online);
}

const ErrorDescriptions: CapabilityStatusToStringMap = {
  [CapabilityStatus.PartiallyUnavailable]: "Some ServiceControl Error instances are not responding.",
  [CapabilityStatus.Available]: "All ServiceControl Error instances are available.",
};

const ErrorHelpButtonText: CapabilityStatusToStringMap = {
  [CapabilityStatus.Available]: "View Failed Messages",
};

const ErrorHelpButtonUrl: CapabilityStatusToStringMap = {
  [CapabilityStatus.PartiallyUnavailable]: "https://docs.particular.net/servicecontrol/troubleshooting",
  [CapabilityStatus.Available]: "#/failed-messages",
};

enum ErrorIndicatorTooltip {
  InstanceAvailable = "The ServiceControl Error instance is configured and available",
  InstanceUnavailable = "The ServiceControl Error instance is not responding",
}

export function useErrorCapability(): CapabilityComposable {
  const { getIconForStatus, getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus, createIndicator } = useCapabilityBase();

  // This tells us the connection state to the primary ServiceControl Error instance.
  // Auto refreshed every 5 seconds.
  const connectionsStore = useConnectionsAndStatsStore();
  const connectionState = connectionsStore.connectionState;

  // This gives us version information for the primary ServiceControl instance
  const environmentStore = useEnvironmentAndVersionsStore();
  const { environment } = storeToRefs(environmentStore);

  // This gives us the list of secondary remote instances configured in ServiceControl.
  // Uses auto-refresh to periodically check status (every 5 seconds)
  const { store: remoteInstancesStore } = useRemoteInstancesAutoRefresh();
  const { remoteInstances } = storeToRefs(remoteInstancesStore);

  // Filter secondary instances to only include error instances (those with error_retention_period in configuration)
  const secondaryErrorInstances = computed(() => filterErrorInstances(remoteInstances.value));

  // Check if primary instance is connected
  const isPrimaryConnected = computed(() => connectionState.connected && !connectionState.unableToConnect);

  // Total instance count (primary + secondary error instances)
  const totalInstanceCount = computed(() => 1 + secondaryErrorInstances.value.length);

  // Count of available instances
  const availableInstanceCount = computed(() => {
    let count = isPrimaryConnected.value ? 1 : 0;
    count += secondaryErrorInstances.value.filter((instance) => instance.status === RemoteInstanceStatus.Online).length;
    return count;
  });

  // Determine overall error status
  const errorStatus = computed(() => {
    // 1. Check if primary instance is unavailable and all secondary error instances are unavailable
    if (!isPrimaryConnected.value && allErrorInstancesUnavailable(secondaryErrorInstances.value)) {
      return CapabilityStatus.Unavailable;
    }

    // 2. Check if some but not all instances are unavailable (partially unavailable)
    if (availableInstanceCount.value > 0 && availableInstanceCount.value < totalInstanceCount.value) {
      return CapabilityStatus.PartiallyUnavailable;
    }

    // 3. All instances are available
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

    // Add indicator for primary instance
    const primaryLabel = totalInstanceCount.value > 1 ? "Primary" : "Instance";
    const primaryTooltip = isPrimaryConnected.value ? ErrorIndicatorTooltip.InstanceAvailable : ErrorIndicatorTooltip.InstanceUnavailable;
    indicators.push(createIndicator(primaryLabel, isPrimaryConnected.value ? CapabilityStatus.Available : CapabilityStatus.Unavailable, primaryTooltip, serviceControlClient.url, environment.value.sc_version));

    // Add an indicator for each secondary error instance
    if (secondaryErrorInstances.value.length > 0) {
      secondaryErrorInstances.value.forEach((instance, index) => {
        const isAvailable = instance.status === RemoteInstanceStatus.Online;
        const label = `Instance ${index + 2}`; // Start at 2 since primary is Instance 1
        const tooltip = isAvailable ? ErrorIndicatorTooltip.InstanceAvailable : ErrorIndicatorTooltip.InstanceUnavailable;

        indicators.push(createIndicator(label, isAvailable ? CapabilityStatus.Available : CapabilityStatus.Unavailable, tooltip, instance.api_uri, instance.version));
      });
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
