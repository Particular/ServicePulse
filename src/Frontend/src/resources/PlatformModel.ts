export type PlatformInstanceKind = "error" | "audit" | "monitoring";
export type PlatformInstanceRole = "primary-error" | "remote-error" | "remote-audit" | "monitoring";
export type PlatformInstanceHealth = "healthy" | "degraded" | "unavailable";

export interface ServicePulse {
  name: string;
  version: string;
  health: "healthy";
}

export interface PlatformInstance {
  id: string;
  name: string;
  kind: PlatformInstanceKind;
  role: PlatformInstanceRole;
  version: string;
  health: PlatformInstanceHealth;
  apiUrl: string;
  transportType?: string;
  errorLogQueue?: string;
  errorQueue?: string;
  forwardErrorMessages?: boolean;
  errorRetentionPeriod?: string;
  auditRetentionPeriod?: string;
}

export interface PlatformModel {
  primary: PlatformInstance;
  remotes: PlatformInstance[];
  monitoring: PlatformInstance | null;
  servicePulse: ServicePulse;
}
