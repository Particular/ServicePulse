import { computed } from "vue";
import { StatusIndicator } from "@/components/platformcapabilities/types";
import { CapabilityStatus } from "@/components/platformcapabilities/constants";
import useIsAllMessagesSupported, { minimumSCVersionForAllMessages } from "@/components/audit/isAllMessagesSupported";
import { storeToRefs } from "pinia";
import { type CapabilityComposable, type CapabilityStatusToStringMap, useCapabilityBase } from "./BaseCapability";
import useRemoteInstancesAutoRefresh from "@/composables/useRemoteInstancesAutoRefresh";
import useAuditStoreAutoRefresh from "@/composables/useAuditStoreAutoRefresh";
import { RemoteInstanceStatus, RemoteInstanceType, type RemoteInstance } from "@/resources/RemoteInstance";
import routeLinks from "@/router/routeLinks";

/**
 * Checks if a remote instance is an audit instance using the cached instance type
 */
export function isAuditInstance(instance: RemoteInstance): boolean {
  return instance.cachedInstanceType === RemoteInstanceType.Audit;
}

/**
 * Filters remote instances to only include audit instances
 */
export function filterAuditInstances(instances: RemoteInstance[] | null | undefined): RemoteInstance[] {
  if (!instances) {
    return [];
  }
  return instances.filter(isAuditInstance);
}

const AuditingDescriptions: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]:
    "A ServiceControl Audit instance is connected but no successful messages have been processed yet or you don't have auditing enabled for any endpoints. Click 'Learn More' to find out how to set up auditing for your endpoints.",
  [CapabilityStatus.InstanceNotConfigured]: "A ServiceControl Audit instance has not been configured. Click 'Get Started' to learn more about setting up auditing.",
  [CapabilityStatus.Unavailable]: "All ServiceControl Audit instances are configured but not responding. Click 'Learn More' for troubleshooting steps.",
  [CapabilityStatus.PartiallyUnavailable]: "Some ServiceControl Audit instances are not responding.",
  [CapabilityStatus.Available]: "All ServiceControl Audit instances are available and endpoints have been configured to send audit messages.",
};

const AuditingHelpButtonText: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]: "Learn More",
  [CapabilityStatus.InstanceNotConfigured]: "Get Started",
  [CapabilityStatus.Available]: "View Messages",
};

const AuditingHelpButtonUrl: CapabilityStatusToStringMap = {
  [CapabilityStatus.EndpointsNotConfigured]: "https://docs.particular.net/nservicebus/operations/auditing",
  [CapabilityStatus.InstanceNotConfigured]: "https://docs.particular.net/servicecontrol/audit-instances/",
  [CapabilityStatus.Unavailable]: "https://docs.particular.net/servicecontrol/troubleshooting",
  [CapabilityStatus.PartiallyUnavailable]: "https://docs.particular.net/servicecontrol/troubleshooting",
  [CapabilityStatus.Available]: routeLinks.messages.root,
};

enum AuditingIndicatorTooltip {
  InstanceAvailable = "The Audit instance is configured and available",
  InstanceUnavailable = "The Audit instance is configured but not responding",
  MessagesAvailable = "Endpoints have been configured to send audit messages",
  MessagesUnavailable = "No successful messages have been processed yet or auditing is not enabled for any endpoints",
  AllMessagesNotSupported = `The 'All Messages' feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher`,
}

/**
 * Checks if all audit remote instances are unavailable
 */
export function allAuditInstancesUnavailable(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.every((instance) => instance.status !== RemoteInstanceStatus.Online);
}

/**
 * Checks if any audit remote instances are unavailable (but not all)
 */
export function hasUnavailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.some((instance) => instance.status !== RemoteInstanceStatus.Online);
}

/**
 * Checks if any audit remote instances are available
 */
export function hasAvailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.some((instance) => instance.status === RemoteInstanceStatus.Online);
}

/**
 * Checks if some but not all audit instances are unavailable
 */
export function hasPartiallyUnavailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return hasUnavailableAuditInstances(instances) && hasAvailableAuditInstances(instances);
}

export function useAuditingCapability(): CapabilityComposable {
  const { getIconForStatus, getDescriptionForStatus, getHelpButtonTextForStatus, getHelpButtonUrlForStatus, createIndicator } = useCapabilityBase();

  // This gives us the list of remote instances configured in ServiceControl.
  // Uses auto-refresh to periodically check status (every 5 seconds)
  const { store: remoteInstancesStore } = useRemoteInstancesAutoRefresh();
  const { remoteInstances } = storeToRefs(remoteInstancesStore);

  // Filter to only include audit instances (those with audit_retention_period in configuration)
  const auditInstances = computed(() => filterAuditInstances(remoteInstances.value));

  // This gives us the hasSuccessfulMessages flag which indicates if any successful messages exist.
  // Uses auto-refresh (minimal) to periodically check for at least 1 successful message (every 5 seconds)
  const { store: auditStore } = useAuditStoreAutoRefresh();
  const { hasSuccessfulMessages } = storeToRefs(auditStore);

  // This tells us if the "All Messages" feature is supported by checking the SC version
  const isAllMessagesSupported = useIsAllMessagesSupported();

  // Determine overall auditing status
  const auditStatus = computed(() => {
    // 1. Check if there are any audit instances configured.
    if (auditInstances.value.length === 0) {
      return CapabilityStatus.InstanceNotConfigured;
    }

    // 2. Check if all audit instances are unavailable
    if (allAuditInstancesUnavailable(auditInstances.value)) {
      return CapabilityStatus.Unavailable;
    }

    // 3. Check if some but not all audit instances are unavailable
    if (hasPartiallyUnavailableAuditInstances(auditInstances.value)) {
      return CapabilityStatus.PartiallyUnavailable;
    }

    // 4. Check if the 'All Messages' feature is not supported OR there are no successful messages
    if (!isAllMessagesSupported.value || !hasSuccessfulMessages.value) {
      return CapabilityStatus.EndpointsNotConfigured;
    }

    // 5. Audit instance is available and there are successful audit messages
    return CapabilityStatus.Available;
  });

  // Determine icon based on status
  const auditIcon = computed(() => getIconForStatus(auditStatus.value));

  // Determine description based on status
  const auditDescription = computed(() => getDescriptionForStatus(auditStatus.value, AuditingDescriptions));

  // Determine help button text based on status
  const auditHelpButtonText = computed(() => getHelpButtonTextForStatus(auditStatus.value, AuditingHelpButtonText));

  // Determine help button URL based on status
  const auditHelpButtonUrl = computed(() => getHelpButtonUrlForStatus(auditStatus.value, AuditingHelpButtonUrl));

  // Determine indicators
  const auditIndicators = computed(() => {
    const indicators: StatusIndicator[] = [];

    // Add an indicator for each remote audit instance
    if (auditInstances.value.length > 0) {
      auditInstances.value.forEach((instance, index) => {
        const isAvailable = instance.status === RemoteInstanceStatus.Online;
        const label = auditInstances.value.length > 1 ? `Instance ${index + 1}` : "Instance";
        const tooltip = isAvailable ? AuditingIndicatorTooltip.InstanceAvailable : AuditingIndicatorTooltip.InstanceUnavailable;

        indicators.push(createIndicator(label, isAvailable ? CapabilityStatus.Available : CapabilityStatus.Unavailable, tooltip, instance.api_uri, instance.version));
      });
    }

    // Messages available indicator - show if at least one instance is available
    if (hasAvailableAuditInstances(auditInstances.value)) {
      const messagesAvailable = isAllMessagesSupported.value && hasSuccessfulMessages.value;

      let messageTooltip: string;
      if (messagesAvailable) {
        messageTooltip = AuditingIndicatorTooltip.MessagesAvailable;
      } else if (!isAllMessagesSupported.value) {
        messageTooltip = AuditingIndicatorTooltip.AllMessagesNotSupported;
      } else {
        messageTooltip = AuditingIndicatorTooltip.MessagesUnavailable;
      }

      indicators.push(createIndicator("Messages", messagesAvailable ? CapabilityStatus.Available : CapabilityStatus.EndpointsNotConfigured, messageTooltip));
    }

    return indicators;
  });

  // Loading state - true if remote instances haven't been loaded yet
  const isLoading = computed(() => remoteInstances.value === null || remoteInstances.value === undefined);

  return {
    status: auditStatus,
    icon: auditIcon,
    description: auditDescription,
    indicators: auditIndicators,
    isLoading,
    helpButtonText: auditHelpButtonText,
    helpButtonUrl: auditHelpButtonUrl,
  };
}
