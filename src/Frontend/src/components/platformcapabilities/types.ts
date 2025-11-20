export interface StatusIndicator {
  label: string;
  status: CapabilityStatus;
  tooltip: string;
}

export enum CapabilityStatus {
  Unavailable = "Unavailable", // Instance is configured but not responding or not available
  Available = "Available", // Instance is available and responding
  NotConfigured = "Not Configured", // Instance is not configured. Promo should be shown
}

export enum Capability {
  Monitoring = "Monitoring",
  Auditing = "Auditing",
}
