import type { RemoteInstance } from "@/resources/RemoteInstance";
import type RootUrls from "@/resources/RootUrls";

const latestPlatformVersion = "6.19.3";

export type PlatformHealthMockScenarioName = "single-region-healthy" | "single-region-warning" | "single-region-danger" | "single-region-outdated" | "multi-region-healthy" | "multi-region-warning" | "multi-region-danger";

export type PlatformHealthMockStatus = "healthy" | "degraded" | "unavailable";

export interface PlatformHealthMockState {
  scenario: PlatformHealthMockScenarioName;
  primary: {
    name: string;
    version: string;
    status: PlatformHealthMockStatus;
  };
  remotes: Array<{
    id: `remote-${number}`;
    apiUri: string;
    version: string;
    status: PlatformHealthMockStatus;
    instanceType: "audit" | "error";
  }>;
  monitoring: {
    configured: boolean;
    version: string;
    status: PlatformHealthMockStatus;
  } | null;
  warnings: string[];
}

declare global {
  interface Window {
    __platformHealth?: {
      getState: () => PlatformHealthMockState;
      reset: () => PlatformHealthMockState;
      setScenario: (name: PlatformHealthMockScenarioName) => PlatformHealthMockState;
      setStatus: (id: "primary" | "monitoring" | `remote-${number}`, status: PlatformHealthMockStatus) => PlatformHealthMockState;
      setWarnings: (warnings: string[]) => PlatformHealthMockState;
      clearWarnings: () => PlatformHealthMockState;
    };
  }
}

let state = createScenario("single-region-warning");

export function installPlatformHealthDevControls() {
  window.__platformHealth = {
    getState: () => cloneState(state),
    reset: () => {
      state = createScenario("single-region-warning");
      return cloneState(state);
    },
    setScenario: (name) => {
      state = createScenario(name);
      return cloneState(state);
    },
    setStatus: (id, status) => {
      state = updateStatus(state, id, status);
      return cloneState(state);
    },
    setWarnings: (warnings) => {
      state = { ...state, warnings: [...warnings] };
      return cloneState(state);
    },
    clearWarnings: () => {
      state = { ...state, warnings: [] };
      return cloneState(state);
    },
  };
}

export function getPlatformHealthPrimaryRoot(): RootUrls {
  const current = state;

  return {
    description: "The management backend for the Particular Service Platform",
    endpoints_error_url: "http://localhost:33333/api/endpoints/{name}/errors/{?page,per_page,direction,sort}",
    known_endpoints_url: "/endpoints/known",
    endpoints_message_search_url: "http://localhost:33333/api/endpoints/{name}/messages/search/{keyword}/{?page,per_page,direction,sort}",
    endpoints_messages_url: "http://localhost:33333/api/endpoints/{name}/messages/{?page,per_page,direction,sort}",
    audit_count_url: "http://localhost:33333/api/endpoints/{name}/audit-count",
    endpoints_url: "http://localhost:33333/api/endpoints",
    errors_url: "http://localhost:33333/api/errors/{?page,per_page,direction,sort}",
    configuration: "http://localhost:33333/api/configuration",
    remote_configuration: "http://localhost:33333/api/configuration/remotes",
    message_search_url: "http://localhost:33333/api/messages/search/{keyword}/{?page,per_page,direction,sort}",
    license_status: "valid",
    license_details: "http://localhost:33333/api/license",
    name: current.primary.name,
    sagas_url: "http://localhost:33333/api/sagas",
    event_log_items: "http://localhost:33333/api/eventlogitems",
    archived_groups_url: "http://localhost:33333/api/errors/groups/{classifier?}",
    get_archive_group: "http://localhost:33333/api/archive/groups/id/{groupId}",
    platform_health_status: current.primary.status,
    platform_health_mode: current.scenario.startsWith("multi-region") ? "multi-region" : "single-region",
    platform_health_warnings: current.warnings,
    platform_health_version: current.primary.version,
  } as RootUrls;
}

export function getPlatformHealthRemoteInstances(): RemoteInstance[] {
  return state.remotes.map(
    (remote) =>
      ({
        api_uri: remote.apiUri,
        version: remote.version,
        status: remote.status === "healthy" ? "online" : "unavailable",
        configuration: {
          data_retention: remote.instanceType === "error" ? { error_retention_period: "14.00:00:00" } : { audit_retention_period: "7.00:00:00" },
        },
        platform_health_status: remote.status,
        platform_health_id: remote.id,
      }) as RemoteInstance
  );
}

export function getPlatformHealthMonitoringRoot() {
  return {
    Metrics: state.monitoring?.status === "unavailable" ? null : {},
    platform_health_status: state.monitoring?.status ?? "healthy",
    platform_health_version: state.monitoring?.version ?? latestPlatformVersion,
  };
}

export function getPlatformHealthWarnings() {
  return [...state.warnings];
}

function updateStatus(current: PlatformHealthMockState, id: "primary" | "monitoring" | `remote-${number}`, status: PlatformHealthMockStatus) {
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

function createScenario(name: PlatformHealthMockScenarioName): PlatformHealthMockState {
  switch (name) {
    case "single-region-healthy":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        warnings: [],
      };
    case "single-region-warning":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "degraded", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        warnings: [],
      };
    case "single-region-danger":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "unavailable" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "degraded", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "unavailable" },
        warnings: [],
      };
    case "single-region-outdated":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: latestPlatformVersion, status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        warnings: [],
      };
    case "multi-region-healthy":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
        ],
        monitoring: null,
        warnings: [],
      };
    case "multi-region-warning":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
        ],
        monitoring: null,
        warnings: ["Cross-region topology metadata is inferred in this prototype."],
      };
    case "multi-region-danger":
      return {
        scenario: name,
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "degraded", instanceType: "error" },
        ],
        monitoring: null,
        warnings: [],
      };
  }
}

function cloneState(current: PlatformHealthMockState): PlatformHealthMockState {
  return {
    ...current,
    primary: { ...current.primary },
    remotes: current.remotes.map((remote) => ({ ...remote })),
    monitoring: current.monitoring ? { ...current.monitoring } : null,
    warnings: [...current.warnings],
  };
}
