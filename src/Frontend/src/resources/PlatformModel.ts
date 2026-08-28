export type PlatformTopologyMode = "single-region" | "multi-region";
export type PlatformInstanceKind = "error" | "audit" | "monitoring";
export type PlatformInstanceRole = "primary-error" | "cross-region-primary" | "remote-error" | "remote-audit" | "monitoring";
export type PlatformInstanceHealth = "healthy" | "degraded" | "unavailable";

export interface PlatformInstance {
  id: string;
  name: string;
  kind: PlatformInstanceKind;
  role: PlatformInstanceRole;
  version: string;
  health: PlatformInstanceHealth;
  configured: boolean;
  sourceUrl?: string;
  ingestErrorMessages?: boolean;
}

export interface PlatformModel {
  mode: PlatformTopologyMode;
  primary: PlatformInstance | null;
  remotes: PlatformInstance[];
  monitoring: PlatformInstance | null;
  warnings: string[];
}
