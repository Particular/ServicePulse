import { minimumSCVersionForAllMessages } from "@/components/audit/isAllMessagesSupported";

export enum MonitoringCardDescription {
  NotConfigured = "Enable real-time endpoint performance monitoring to track throughput, processing times, and system health across your entire distributed system.",
  Unavailable = "Monitoring instance is not responding",
  PartiallyAvailable = "Monitoring instance is connected but no endpoints are sending throughput data. This may be because no endpoints are running or no endpoints have the monitoring plugin enabled.",
  Available = "Monitoring is available and receiving throughput data from endpoints",
}

export enum MonitoringIndicatorTooltip {
  InstanceAvailable = "Monitoring instance is configured and available",
  InstanceUnavailable = "Monitoring instance is configured but not responding",
  InstanceNotConfigured = "Monitoring is not configured in ServiceControl",
  DataAvailable = "Endpoints are sending throughput data",
  DataUnavailable = "No endpoints are sending throughput data. Endpoints may not be running or may not have the monitoring plugin enabled.",
}

export enum AuditingCardDescription {
  NotConfigured = "Auditing instance is connected but no successful messages have been processed yet or you don't have auditing enabled for any endpoints. Enable auditing to track message flow and processing across your distributed system.",
  Unavailable = "Auditing instance is not responding",
  NotSupported = `Auditing instance is connected but the "All Messages" feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher.`,
  Available = "Auditing is available and processing successful messages",
}

export enum AuditingIndicatorTooltip {
  InstanceAvailable = "Auditing instance is configured and available",
  InstanceUnavailable = "Auditing instance is not responding",
  MessagesAvailable = "Successful messages are being processed",
  MessagesUnavailable = "No successful messages have been processed yet or auditing is not enabled for any endpoints",
  AllMessagesNotSupported = `The 'All Messages' feature requires ServiceControl ${minimumSCVersionForAllMessages} or higher`,
}
