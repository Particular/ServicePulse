export type PlatformInstanceKind = "error" | "audit" | "monitoring";
export type PlatformInstanceRole = "primary-error" | "remote-error" | "remote-audit" | "monitoring";
export type PlatformInstanceHealth = "healthy" | "degraded" | "unavailable";

export interface PlatformInstance {
  id: string;
  name: string;
  kind: PlatformInstanceKind;
  role: PlatformInstanceRole;
  version: string;
  health: PlatformInstanceHealth;
  apiUrl: string;
}

export interface PlatformModel {
  primary: PlatformInstance;
  remotes: PlatformInstance[];
  monitoring: PlatformInstance | null;
  warnings: string[];
}
