export interface StatusIndicator {
  label: string;
  status: CapabilityStatus;
  tooltip: string;
}

export enum CapabilityStatus {
  Unavailable = "Unavailable", // Instance is configured but not responding or not available
  PartiallyUnavailable = "Degraded", // At least one but not all instances are unavailable
  Available = "Available", // Instance is available and responding
  EndpointsNotConfigured = "Endpoints Not Configured", // Instance is not configured. Promo should be shown
  InstanceNotConfigured = "Instance Not Configured", // Instance is not configured at all
}

export enum Capability {
  Monitoring = "Monitoring",
  Auditing = "Auditing",
  Error = "Recoverability",
}
