import { computed } from "vue";
import { CapabilityStatus, StatusIndicator } from "@/components/platformcapabilities/types";
import { storeToRefs } from "pinia";
import { useServiceControlStore } from "@/stores/ServiceControlStore";
import { useMonitoringStore } from "@/stores/MonitoringStore";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { type CapabilityComposable, useCapabilityBase } from "./BaseCapability";

enum MonitoringCardDescription {
  NotConfigured = "The Monitoring instance is connected but no endpoints are sending throughput data. This may be because no endpoints are running or no endpoints have the monitoring plugin enabled.",
  InstanceNotConfigured = "The Monitoring instance is not configured in ServicePulse.",
  Unavailable = "The Monitoring instance is configured but not responding.",
  Available = "Monitoring is available and receiving throughput data from endpoints.",
}

enum MonitoringIndicatorTooltip {
  InstanceAvailable = "The Monitoring instance is configured and available",
  InstanceUnavailable = "The Monitoring instance is configured but not responding",
  InstanceNotConfigured = "Monitoring is not configured in ServicePulse",
  DataAvailable = "Endpoints are sending throughput data",
  DataUnavailable = "No endpoints are sending throughput data. Endpoints may not be running or may not have the monitoring plugin enabled.",
}

export function useMonitoringCapability(): CapabilityComposable {
  const { getIconForStatus, createIndicator } = useCapabilityBase();
  const serviceControlStore = useServiceControlStore();
  // this tells us if monitoring is configured in ServiceControl
  const { isMonitoringEnabled } = storeToRefs(serviceControlStore);
  const monitoringStore = useMonitoringStore();
  // this tells us if there are any endpoints sending data
  const { endpointListIsEmpty } = storeToRefs(monitoringStore);
  const connectionsStore = useConnectionsAndStatsStore();
  // this tells us the connection state to the monitoring instance
  const monitoringConnectionState = connectionsStore.monitoringConnectionState;

  // Trigger initial load of monitoring endpoints if monitoring is enabled
  if (isMonitoringEnabled.value && endpointListIsEmpty.value) {
    // TODO: This is not auto refreshed. User will need to manually refresh the page to get updated data. Ideally this would auto refresh periodically.
    monitoringStore.updateEndpointList();
  }

  // Determine overall monitoring status
  const monitoringStatus = computed(() => {
    const isConfiguredInServiceControl = isMonitoringEnabled.value;
    const connectionSuccessful = monitoringConnectionState.connected && !monitoringConnectionState.unableToConnect;

    // Disabled - configured but not responding
    if (isConfiguredInServiceControl && !connectionSuccessful) {
      return CapabilityStatus.Unavailable;
    }

    // There are endpoints sending data. Fully enabled and working
    if (!endpointListIsEmpty.value) {
      return CapabilityStatus.Available;
    }

    // Monitoring is configured and connected but no endpoints are sending data
    return CapabilityStatus.NotConfigured;
  });

  // Icon based on status
  const monitoringIcon = computed(() => getIconForStatus(monitoringStatus.value));

  // Description based on status
  const monitoringDescription = computed(() => {
    const instanceAvailable = isMonitoringEnabled.value;

    if (!instanceAvailable) {
      return MonitoringCardDescription.InstanceNotConfigured;
    }

    if (monitoringStatus.value === CapabilityStatus.NotConfigured) {
      return MonitoringCardDescription.NotConfigured;
    }

    if (monitoringStatus.value === CapabilityStatus.Available) {
      return MonitoringCardDescription.Available;
    }

    // Unavailable
    return MonitoringCardDescription.Unavailable;
  });

  const monitoringIndicators = computed(() => {
    const indicators: StatusIndicator[] = [];

    // Instance specific states
    const connectionSuccessful = monitoringConnectionState.connected && !monitoringConnectionState.unableToConnect;
    const instanceAvailable = isMonitoringEnabled.value && connectionSuccessful;

    const instanceTooltip = instanceAvailable ? MonitoringIndicatorTooltip.InstanceAvailable : !isMonitoringEnabled.value ? MonitoringIndicatorTooltip.InstanceNotConfigured : MonitoringIndicatorTooltip.InstanceUnavailable;

    if (isMonitoringEnabled.value) {
      indicators.push(createIndicator("Instance", instanceAvailable ? CapabilityStatus.Available : CapabilityStatus.Unavailable, instanceTooltip));
    }

    // data available indicator - only show if instance is connected
    if (instanceAvailable) {
      indicators.push(
        createIndicator("Metrics", !endpointListIsEmpty.value ? CapabilityStatus.Available : CapabilityStatus.NotConfigured, !endpointListIsEmpty.value ? MonitoringIndicatorTooltip.DataAvailable : MonitoringIndicatorTooltip.DataUnavailable)
      );
    }

    return indicators;
  });

  // Loading state - monitoring is loading if we haven't attempted connection yet
  const isLoading = computed(() => !monitoringConnectionState.connected && !monitoringConnectionState.unableToConnect && monitoringConnectionState.connecting);

  return {
    status: monitoringStatus,
    icon: monitoringIcon,
    description: monitoringDescription,
    indicators: monitoringIndicators,
    isLoading,
  };
}
