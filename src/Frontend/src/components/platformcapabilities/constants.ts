import { minimumSCVersionForAllMessages } from "@/components/audit/isAllMessagesSupported";

export enum MonitoringCardDescription {
  NotConfigured = "Monitoring instance is connected but no endpoints are sending throughput data. This may be because no endpoints are running or no endpoints have the monitoring plugin enabled.",
  InstanceNotConfigured = "The Monitoring instance is not configured in ServiceControl.",
  Unavailable = "The Monitoring instance is configured but not responding.",
  Available = "Monitoring is available and receiving throughput data from endpoints.",
}

export enum MonitoringIndicatorTooltip {
  InstanceAvailable = "Monitoring instance is configured and available",
  InstanceUnavailable = "The Monitoring instance is configured but not responding",
  InstanceNotConfigured = "Monitoring is not configured in ServiceControl",
  DataAvailable = "Endpoints are sending throughput data",
  DataUnavailable = "No endpoints are sending throughput data. Endpoints may not be running or may not have the monitoring plugin enabled.",
}

export enum AuditingCardDescription {
  NotConfigured = "Auditing instance is connected but no successful messages have been processed yet or you don't have auditing enabled for any endpoints.",
  Unavailable = "The Auditing instance is configured but not responding.",
  NotSupported = `Auditing instance is connected but the "All Messages" feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher.`,
  Available = "Auditing is available and processing successful messages.",
}

export enum AuditingIndicatorTooltip {
  InstanceAvailable = "Auditing instance is configured and available",
  InstanceUnavailable = "The Auditing instance is configured but not responding",
  MessagesAvailable = "Successful messages are being processed",
  MessagesUnavailable = "No successful messages have been processed yet or auditing is not enabled for any endpoints",
  AllMessagesNotSupported = `The 'All Messages' feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher`,
}
