import type { PlatformInstanceHealth, PlatformModel } from "@/resources/PlatformModel";

export type PlatformHealthSeverity = "danger" | "warning" | "none";

export type PlatformHealthResponse = PlatformModel;

export interface PlatformHealthRow {
  type: string;
  instanceName: string;
  apiUrl: string;
  version: string;
  health: PlatformInstanceHealth;
  note: string;
  upgradeAvailable: boolean;
  latestVersion: string;
  upgradeLink: string;
  isExpandable: boolean;
  details: string[];
}
