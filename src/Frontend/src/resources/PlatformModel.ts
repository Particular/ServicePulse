export type PlatformModelMode = "single-region" | "multi-region";
export type PlatformInstanceKind = "error" | "audit" | "monitoring";
export type PlatformInstanceRole = "primary-error" | "cross-region-primary" | "remote-error" | "remote-audit" | "monitoring";
export type PlatformInstanceHealth = "healthy" | "degraded" | "unavailable";

export interface PlatformInstanceModel {
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
  mode: PlatformModelMode;
  primary: PlatformInstanceModel | null;
  remotes: PlatformInstanceModel[];
  monitoring: PlatformInstanceModel | null;
  warnings: string[];
}
