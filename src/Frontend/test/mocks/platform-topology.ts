import { RemoteInstanceStatus, RemoteInstanceType, type RemoteInstance } from "@/resources/RemoteInstance";

export const latestPlatformVersion = "6.19.3";

export type PlatformTopologyScenarioName = "audit-remotes-healthy" | "audit-remotes-danger" | "remote-errors-healthy" | "remote-errors-danger" | "primary-unavailable";
export type PlatformTopologyStatus = "healthy" | "degraded" | "unavailable";

export interface PlatformTopologyRemote {
  id: `remote-${number}`;
  name: string;
  apiUri: string;
  version: string;
  status: PlatformTopologyStatus;
  instanceType: "audit" | "error";
}

export interface PlatformTopology {
  scenario: PlatformTopologyScenarioName;
  primary: {
    name: string;
    version: string;
    status: PlatformTopologyStatus;
  };
  remotes: PlatformTopologyRemote[];
  monitoring: {
    configured: boolean;
    version: string;
    status: PlatformTopologyStatus;
  } | null;
}

export function createPlatformTopology(name: PlatformTopologyScenarioName): PlatformTopology {
  switch (name) {
    case "audit-remotes-healthy":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", name: "Particular.ServiceControl.Audit", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", name: "Particular.ServiceControl.Audit-Blue", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
      };
    case "audit-remotes-danger":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", name: "Particular.ServiceControl.Audit", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "unavailable", instanceType: "audit" },
          { id: "remote-1", name: "Particular.ServiceControl.Audit-Blue", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "unavailable", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
      };
    case "remote-errors-healthy":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", name: "Particular.ServiceControl.RegionA", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", name: "Particular.ServiceControl.RegionB", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
        ],
        monitoring: null,
      };
    case "remote-errors-danger":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", name: "Particular.ServiceControl.RegionA", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", name: "Particular.ServiceControl.RegionB", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "unavailable", instanceType: "error" },
        ],
        monitoring: null,
      };
    case "primary-unavailable":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "unavailable" },
        remotes: [],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
      };
  }
}

export function clonePlatformTopology(current: PlatformTopology): PlatformTopology {
  return {
    ...current,
    primary: { ...current.primary },
    remotes: current.remotes.map((remote) => ({ ...remote })),
    monitoring: current.monitoring ? { ...current.monitoring } : null,
  };
}

export function updatePlatformTopologyStatus(current: PlatformTopology, id: "primary" | "monitoring" | `remote-${number}`, status: PlatformTopologyStatus): PlatformTopology {
  if (id === "primary") {
    return { ...current, primary: { ...current.primary, status } };
  }

  if (id === "monitoring" && current.monitoring) {
    return { ...current, monitoring: { ...current.monitoring, status } };
  }

  return {
    ...current,
    remotes: current.remotes.map((remote) => (remote.id === id ? { ...remote, status } : remote)),
  };
}

export function toRemoteInstances(topology: Pick<PlatformTopology, "remotes">): RemoteInstance[] {
  return topology.remotes.map((remote) => ({
    api_uri: remote.apiUri,
    version: remote.version,
    status: remote.status === "healthy" ? RemoteInstanceStatus.Online : RemoteInstanceStatus.Unavailable,
    configuration: {
      host: {
        instance_name: remote.name,
      },
      data_retention: remote.instanceType === "error" ? { error_retention_period: "14.00:00:00" } : { audit_retention_period: "7.00:00:00" },
    },
    platform_health_status: remote.status,
    platform_health_id: remote.id,
    cachedInstanceType: remote.instanceType === "error" ? RemoteInstanceType.Error : RemoteInstanceType.Audit,
  }));
}
