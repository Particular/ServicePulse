import { computed, type Ref, watchEffect } from "vue";
import { CapabilityStatus, StatusIndicator } from "@/components/platformcapabilities/types";
import { faCheck, faInfoCircle, faTimes, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type ConnectionTestResults from "@/resources/ConnectionTestResults";
import useIsAllMessagesSupported from "@/components/audit/isAllMessagesSupported";
import { storeToRefs } from "pinia";
import { useAuditStore } from "@/stores/AuditStore";
import { AuditingCardDescription, AuditingIndicatorTooltip } from "@/components/platformcapabilities/constants";
import { MessageStatus } from "@/resources/Message";

// http://localhost:33333/api/configuration/remotes
/**
 [
  {
    "api_uri": "http://servicecontrol-audit:44444",
    "version": "6.7.6",
    "status": "online",
    "configuration": {
      "host": {
        "instance_name": "Particular.ServiceControl.Audit",
        "logging": {
          "log_path": "/app/.logs",
          "logging_level": "information"
        }
      },
      "data_retention": {
        "audit_retention_period": "7.00:00:00"
      },
      "performance_tunning": {
        "max_body_size_to_store": 102400
      },
      "transport": {
        "transport_type": "RabbitMQ.QuorumConventionalRouting",
        "audit_log_queue": "audit.log",
        "audit_queue": "audit",
        "forward_audit_messages": false
      },
      "peristence": {
        "persistence_type": "RavenDB"
      },
      "plugins": {

      }
    }
  }
]
 */

export function useAuditingCapability(testResults: Ref<ConnectionTestResults | null>) {
  const auditStore = useAuditStore();
  // this gives us the messages array which includes all messages (successful and failed)
  const { messages } = storeToRefs(auditStore);
  const isAllMessagesSupported = useIsAllMessagesSupported();

  // Count only successful audit messages
  const successfulMessageCount = computed(() => {
    return messages.value.filter((msg) => msg.status === MessageStatus.Successful || msg.status === MessageStatus.ResolvedSuccessfully).length;
  });

  // this tells us if the audit instance is configured and responding
  const auditingConfiguredAndResponding = computed(() => {
    return testResults.value?.audit_connection_result?.connection_successful ?? false;
  });

  watchEffect(() => {
    // Trigger initial load of audit messages if audit is configured
    if (auditingConfiguredAndResponding.value && messages.value.length === 0) {
      // TODO: This is not auto refreshed. User will need to manually refresh the page to get updated data. Ideally this would auto refresh periodically.
      auditStore.refresh();
    }
  });

  const auditStatus = computed(() => {
    // If audit instance is not configured or not responding
    if (!auditingConfiguredAndResponding.value) {
      return CapabilityStatus.Unavailable;
    }

    // If audit instance is available but 'All Messages' feature is not supported or there are no successful audit messages
    if (!isAllMessagesSupported.value || successfulMessageCount.value === 0) {
      return CapabilityStatus.NotConfigured;
    }

    // Audit instance is available and there are successful audit messages
    return CapabilityStatus.Available;
  });

  const auditIcon = computed<IconDefinition>(() => {
    if (auditStatus.value === CapabilityStatus.NotConfigured) {
      return faInfoCircle;
    }

    if (auditStatus.value === CapabilityStatus.Available) {
      return faCheck;
    }

    // Uavailable
    return faTimes;
  });

  const auditDescription = computed(() => {
    if (auditStatus.value === CapabilityStatus.NotConfigured) {
      return AuditingCardDescription.NotConfigured;
    }

    if (auditStatus.value === CapabilityStatus.Available) {
      return AuditingCardDescription.Available;
    }

    // Uavailable
    return AuditingCardDescription.Unavailable;
  });

  const auditIndicators = computed<StatusIndicator[]>(() => {
    const indicators: StatusIndicator[] = [];

    indicators.push({
      label: "Instance",
      status: auditingConfiguredAndResponding.value ? CapabilityStatus.Available : CapabilityStatus.Unavailable,
      tooltip: auditingConfiguredAndResponding.value ? AuditingIndicatorTooltip.InstanceAvailable : AuditingIndicatorTooltip.InstanceUnavailable,
    });

    // Messages available indicator
    if (auditingConfiguredAndResponding.value) {
      const messagesAvailable = isAllMessagesSupported.value && successfulMessageCount.value > 0;

      let messageTooltip = "";
      if (messagesAvailable) {
        messageTooltip = AuditingIndicatorTooltip.MessagesAvailable;
      } else if (!isAllMessagesSupported.value) {
        messageTooltip = AuditingIndicatorTooltip.AllMessagesNotSupported;
      } else {
        messageTooltip = AuditingIndicatorTooltip.MessagesUnavailable;
      }

      indicators.push({
        label: "Messages",
        status: messagesAvailable ? CapabilityStatus.Available : CapabilityStatus.NotConfigured,
        tooltip: messageTooltip,
      });
    }

    return indicators;
  });

  return {
    status: auditStatus,
    icon: auditIcon,
    description: auditDescription,
    indicators: auditIndicators,
  };
}
