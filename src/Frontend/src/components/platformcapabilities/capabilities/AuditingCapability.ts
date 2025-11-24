import { computed, watchEffect } from "vue";
import { CapabilityStatus, StatusIndicator } from "@/components/platformcapabilities/types";
import useIsAllMessagesSupported, { minimumSCVersionForAllMessages } from "@/components/audit/isAllMessagesSupported";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import { MessageStatus } from "@/resources/Message";
import { type CapabilityComposable, useCapabilityBase } from "./BaseCapability";
import { useRemoteInstancesStore } from "@/stores/RemoteInstancesStore";
import { RemoteInstanceStatus, type RemoteInstance } from "@/resources/RemoteInstance";

enum AuditingCardDescription {
  NotConfigured = "Auditing instance is connected but no successful messages have been processed yet or you don't have auditing enabled for any endpoints.",
  Unavailable = "All Auditing instances are configured but not responding.",
  PartiallyUnavailable = "Some Auditing instances are not responding. Check individual instance status below.",
  NotSupported = `Auditing instance is connected but the "All Messages" feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher.`,
  Available = "Auditing is available and processing successful messages.",
}

enum AuditingIndicatorTooltip {
  InstanceAvailable = "Auditing instance is configured and available",
  InstanceUnavailable = "The Auditing instance is configured but not responding",
  MessagesAvailable = "Successful messages are being processed",
  MessagesUnavailable = "No successful messages have been processed yet or auditing is not enabled for any endpoints",
  AllMessagesNotSupported = `The 'All Messages' feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher`,
}

/**
 * Checks if all audit remote instances are unavailable
 */
function allAuditInstancesUnavailable(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.every((instance) => instance.status !== RemoteInstanceStatus.Online);
}

/**
 * Checks if any audit remote instances are unavailable (but not all)
 */
function hasUnavailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.some((instance) => instance.status !== RemoteInstanceStatus.Online);
}

/**
 * Checks if any audit remote instances are available
 */
function hasAvailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return instances.some((instance) => instance.status === RemoteInstanceStatus.Online);
}

/**
 * Checks if some but not all audit instances are unavailable
 */
function hasPartiallyUnavailableAuditInstances(instances: RemoteInstance[] | null | undefined): boolean {
  if (!instances || instances.length === 0) {
    return false;
  }
  return hasUnavailableAuditInstances(instances) && hasAvailableAuditInstances(instances);
}

export function useAuditingCapability(): CapabilityComposable {
  const { getIconForStatus, createIndicator } = useCapabilityBase();

  // This gives us the list of remote instances configured in ServiceControl.
  const remoteInstancesStore = useRemoteInstancesStore();
  const { remoteInstances } = storeToRefs(remoteInstancesStore);

  // This gives us the messages array which includes all messages (successful and failed).
  const auditStore = useAuditStore();
  const { messages } = storeToRefs(auditStore);
  const successfulMessageCount = computed(() => {
    return messages.value.filter((msg) => msg.status === MessageStatus.Successful || msg.status === MessageStatus.ResolvedSuccessfully).length;
  });

  const isAllMessagesSupported = useIsAllMessagesSupported();

  watchEffect(() => {
    // Trigger initial load of audit messages if audit is configured
    if (hasAvailableAuditInstances(remoteInstances.value)) {
      // TODO: This is not auto refreshed. User will need to manually refresh the page to get updated data. Ideally this would auto refresh periodically.
      auditStore.refresh();
    }
  });

  // Determine overall auditing status
  const auditStatus = computed(() => {
    // 1. Check if there are any audit instances configured.
    if (!remoteInstances.value || remoteInstances.value.length === 0) {
      return CapabilityStatus.NotConfigured;
    }

    // 2. Check if all audit instances are unavailable
    if (allAuditInstancesUnavailable(remoteInstances.value)) {
      return CapabilityStatus.Unavailable;
    }

    // 3. Check if some but not all audit instances are unavailable
    if (hasPartiallyUnavailableAuditInstances(remoteInstances.value)) {
      return CapabilityStatus.PartiallyUnavailable;
    }

    // 4. Check if all messages feature is supported and there are successful messages
    if (!isAllMessagesSupported.value || successfulMessageCount.value === 0) {
      return CapabilityStatus.NotConfigured;
    }

    // 5. Audit instance is available and there are successful audit messages
    return CapabilityStatus.Available;
  });

  // Determine icon based on status
  const auditIcon = computed(() => getIconForStatus(auditStatus.value));

  // Determine description based on status
  const auditDescription = computed(() => {
    if (auditStatus.value === CapabilityStatus.NotConfigured) {
      return AuditingCardDescription.NotConfigured;
    }

    if (auditStatus.value === CapabilityStatus.Available) {
      return AuditingCardDescription.Available;
    }

    if (auditStatus.value === CapabilityStatus.PartiallyUnavailable) {
      return AuditingCardDescription.PartiallyUnavailable;
    }

    // Unavailable
    return AuditingCardDescription.Unavailable;
  });

  // Determine indicators
  const auditIndicators = computed(() => {
    const indicators: StatusIndicator[] = [];

    // Add an indicator for each remote audit instance
    if (remoteInstances.value && remoteInstances.value.length > 0) {
      remoteInstances.value.forEach((instance, index) => {
        const isAvailable = instance.status === RemoteInstanceStatus.Online;
        const label = remoteInstances.value!.length > 1 ? `Instance ${index + 1}` : "Instance";
        const tooltip = isAvailable ? AuditingIndicatorTooltip.InstanceAvailable : AuditingIndicatorTooltip.InstanceUnavailable;

        indicators.push(createIndicator(label, isAvailable ? CapabilityStatus.Available : CapabilityStatus.Unavailable, tooltip, instance.api_uri, instance.version));
      });
    }

    // Messages available indicator - show if at least one instance is available
    if (hasAvailableAuditInstances(remoteInstances.value)) {
      const messagesAvailable = isAllMessagesSupported.value && successfulMessageCount.value > 0;

      let messageTooltip = "";
      if (messagesAvailable) {
        messageTooltip = AuditingIndicatorTooltip.MessagesAvailable;
      } else if (!isAllMessagesSupported.value) {
        messageTooltip = AuditingIndicatorTooltip.AllMessagesNotSupported;
      } else {
        messageTooltip = AuditingIndicatorTooltip.MessagesUnavailable;
      }

      indicators.push(createIndicator("Messages", messagesAvailable ? CapabilityStatus.Available : CapabilityStatus.NotConfigured, messageTooltip));
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
  };
}
