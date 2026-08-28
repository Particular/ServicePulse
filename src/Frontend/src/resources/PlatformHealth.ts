export type PlatformHealthMode = "single-region" | "multi-region";
export type PlatformHealthStatus = "healthy" | "degraded" | "unavailable";
export type PlatformHealthSeverity = "danger" | "warning" | "none";

export interface PlatformHealthInstance {
  name: string;
  instanceType: "error" | "audit";
  role: "primary-error" | "cross-region-primary" | "remote-audit" | "remote-error";
  version: string;
  status: PlatformHealthStatus;
  ingestErrorMessages?: boolean;
}

export interface PlatformHealthMonitoring {
  configured: boolean;
  name: string;
  instanceType: "monitoring";
  version: string;
  status: PlatformHealthStatus;
}

export interface PlatformHealthResponse {
  mode: PlatformHealthMode;
  primary: PlatformHealthInstance;
  remotes: PlatformHealthInstance[];
  monitoring: PlatformHealthMonitoring | null;
  warnings: string[];
}

export interface PlatformHealthRow {
  type: string;
  instanceName: string;
  version: string;
  health: PlatformHealthStatus;
  note: string;
  upgradeAvailable: boolean;
  latestVersion: string;
  upgradeLink: string;
}
