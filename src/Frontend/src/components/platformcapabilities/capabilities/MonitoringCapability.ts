import { computed } from "vue";
import { CapabilityStatus, StatusIndicator } from "@/components/platformcapabilities/types";
import { faCheck, faTimes, faExclamationTriangle, faInfoCircle, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { storeToRefs } from "pinia";
import { useServiceControlStore } from "@/stores/ServiceControlStore";
import { useMonitoringStore } from "@/stores/MonitoringStore";
import { useConnectionsAndStatsStore } from "@/stores/ConnectionsAndStatsStore";
import { MonitoringCardDescription, MonitoringIndicatorTooltip } from "@/components/platformcapabilities/constants";

export function useMonitoringCapability() {
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

  const monitoringStatus = computed(() => {
    const isConfiguredInServiceControl = isMonitoringEnabled.value;
    const connectionSuccessful = monitoringConnectionState.connected && !monitoringConnectionState.unableToConnect;

    // Promo mode - not configured
    if (!isConfiguredInServiceControl) {
      return CapabilityStatus.NotConfigured;
    }

    // Disabled - configured but not responding
    if (isConfiguredInServiceControl && !connectionSuccessful) {
      return CapabilityStatus.Unavailable;
    }

    // There are endpoints sending data. Fully enabled and working
    if (!endpointListIsEmpty.value) {
      return CapabilityStatus.Available;
    }

    // Monitoring is configured and connected but no endpoints are sending data
    return CapabilityStatus.PartiallyAvailable;
  });

  const monitoringIcon = computed<IconDefinition>(() => {
    if (monitoringStatus.value === CapabilityStatus.NotConfigured) {
      return faInfoCircle;
    }

    if (monitoringStatus.value === CapabilityStatus.Available) {
      return faCheck;
    }

    if (monitoringStatus.value === CapabilityStatus.PartiallyAvailable) {
      return faExclamationTriangle;
    }

    // Unavailable
    return faTimes;
  });

  const monitoringDescription = computed(() => {
    if (monitoringStatus.value === CapabilityStatus.NotConfigured) {
      return MonitoringCardDescription.NotConfigured;
    }

    if (monitoringStatus.value === CapabilityStatus.Available) {
      return MonitoringCardDescription.Available;
    }

    if (monitoringStatus.value === CapabilityStatus.PartiallyAvailable) {
      return MonitoringCardDescription.PartiallyAvailable;
    }

    // Uavailable
    return MonitoringCardDescription.Unavailable;
  });

  const monitoringIndicators = computed<StatusIndicator[]>(() => {
    const indicators: StatusIndicator[] = [];

    // Instance specific states
    const connectionSuccessful = monitoringConnectionState.connected && !monitoringConnectionState.unableToConnect;
    const instanceAvailable = isMonitoringEnabled.value && connectionSuccessful;

    // no indicators shown in promo mode
    if (monitoringStatus.value !== CapabilityStatus.NotConfigured) {
      indicators.push({
        label: "Instance",
        status: instanceAvailable ? CapabilityStatus.Available : CapabilityStatus.Unavailable,
        tooltip: instanceAvailable ? MonitoringIndicatorTooltip.InstanceAvailable : !isMonitoringEnabled.value ? MonitoringIndicatorTooltip.InstanceNotConfigured : MonitoringIndicatorTooltip.InstanceUnavailable,
      });
    }

    // data available indicator - only show if instance is connected
    if (instanceAvailable) {
      indicators.push({
        label: "Data",
        status: !endpointListIsEmpty.value ? CapabilityStatus.Available : CapabilityStatus.PartiallyAvailable,
        tooltip: !endpointListIsEmpty.value ? MonitoringIndicatorTooltip.DataAvailable : MonitoringIndicatorTooltip.DataUnavailable,
      });
    }

    return indicators;
  });

  return {
    status: monitoringStatus,
    icon: monitoringIcon,
    description: monitoringDescription,
    indicators: monitoringIndicators,
  };
}
