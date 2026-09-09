import type { PlatformInstanceHealth, PlatformModel } from "@/resources/PlatformModel";

export type PlatformHealthSeverity = "danger" | "warning" | "none";

export type PlatformHealthResponse = PlatformModel;

export interface PlatformHealthRow {
  // The instance's own id. Names are not unique: scaled-out audit instances commonly share one
  id: string;
  type: string;
  name: string;
  version: string;
  health: PlatformInstanceHealth;
  note: string;
  upgradeAvailable: boolean;
  latestVersion: string;
  upgradeLink: string;
  infoDetails: string[];
  healthDetails: string[];
}
