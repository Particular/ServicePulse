import { computed } from "vue";
import type { StatusIndicator } from "@/components/platformcapabilities/types";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import { storeToRefs } from "pinia";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";
import usePlatformCapabilitiesRefresh from "@/composables/usePlatformCapabilitiesRefresh";
import routeLinks from "@/router/routeLinks";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";

const MonitoringDescriptions: CapabilityStatusToStringMap = {
  [CapabilityStatus.InstanceNotConfigured]: "The ServiceControl Monitoring instance is not configured. Click 'Get Started' to learn more about setting up monitoring.",
  [CapabilityStatus.Unavailable]: "The ServiceControl Monitoring instance is configured but not responding. Click 'Learn More' to troubleshoot connection issues.",
  [CapabilityStatus.Available]: "The ServiceControl Monitoring instance is available. Use the Metrics indicator to see whether endpoints are currently sending throughput data.",
};

const MonitoringHelpButtonText: CapabilityStatusToStringMap = {
  [CapabilityStatus.InstanceNotConfigured]: "Get Started",
  [CapabilityStatus.Available]: "View Metrics",
};

const MonitoringHelpButtonUrl: CapabilityStatusToStringMap = {
  [CapabilityStatus.InstanceNotConfigured]: "https://docs.particular.net/servicecontrol/monitoring-instances/",
  [CapabilityStatus.Unavailable]: "https://docs.particular.net/servicecontrol/troubleshooting",
  [CapabilityStatus.Available]: routeLinks.monitoring.root,
};

enum MonitoringIndicatorTooltip {
  DataAvailable = "Endpoints have been configured to send throughput data",
  DataUnavailable = "No endpoints are sending throughput data. Endpoints may not be running or may not have the monitoring plugin enabled.",
}

export function useMonitoringCapability(): CapabilityComposable {
  const { getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus, createIndicator } = useCapabilityBase();

  // this tells us if there are any endpoints sending data
  // Uses auto-refresh to periodically check for monitored endpoints (every 5 seconds)
  const { store: platformCapabilitiesStore } = usePlatformCapabilitiesRefresh();
  const { hasMonitoredEndpoints } = storeToRefs(platformCapabilitiesStore);
  const platformModelStore = usePlatformModelStore();
  const hasMonitoringInstance = computed(() => platformModelStore.monitoring !== null);

  // Determine overall monitoring status
  const monitoringStatus = computed(() => {
    const connectionSuccessful = platformModelStore.monitoring?.health === "healthy";

    // 1. Check if a monitoring instance exists in the shared platform model
    if (!hasMonitoringInstance.value) {
      return CapabilityStatus.InstanceNotConfigured;
    }

    // 2. Check if we are connected to the monitoring instance
    if (!connectionSuccessful) {
      return CapabilityStatus.Unavailable;
    }

    // 3. If the instance is configured and reachable, monitoring is available.
    return CapabilityStatus.Available;
  });

  // Determine description based on status
  const monitoringDescription = computed(() => getDescriptionForStatus(monitoringStatus.value, MonitoringDescriptions));

  // Determine help button text based on status
  const monitoringHelpButtonText = computed(() => getHelpButtonTextForStatus(monitoringStatus.value, MonitoringHelpButtonText));

  // Determine help button URL based on status
  const monitoringHelpButtonUrl = computed(() => getHelpButtonUrlForStatus(monitoringStatus.value, MonitoringHelpButtonUrl));

  // Determine indicators
  const monitoringIndicators = computed(() => {
    const indicators: StatusIndicator[] = [];

    const connectionSuccessful = platformModelStore.monitoring?.health === "healthy";
    const instanceAvailable = hasMonitoringInstance.value && connectionSuccessful;

    // data available indicator - only show if instance is connected
    if (instanceAvailable) {
      indicators.push(
        createIndicator(
          "Metrics",
          hasMonitoredEndpoints.value ? CapabilityStatus.Available : CapabilityStatus.EndpointsNotConfigured,
          hasMonitoredEndpoints.value ? MonitoringIndicatorTooltip.DataAvailable : MonitoringIndicatorTooltip.DataUnavailable
        )
      );
    }

    return indicators;
  });

  // Loading state - monitoring is loading if we haven't attempted connection yet
  const isLoading = computed(() => platformModelStore.model === null);

  return {
    status: monitoringStatus,
    description: monitoringDescription,
    indicators: monitoringIndicators,
    isLoading,
    helpButtonText: monitoringHelpButtonText,
    helpButtonUrl: monitoringHelpButtonUrl,
  };
}
