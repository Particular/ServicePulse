import { Status, type default as CustomCheck } from "@/resources/CustomCheck";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type RootUrls from "@/resources/RootUrls";
import { createCustomCheck } from "../preconditions/customChecks";

const latestPlatformVersion = "6.19.3";

export type PlatformHealthMockScenarioName = "single-region-healthy" | "single-region-warning" | "single-region-danger" | "single-region-outdated" | "multi-region-healthy" | "multi-region-danger";
export type PlatformHealthCustomCheckPresetName = "none" | "user-only" | "platform-only-primary" | "platform-only-primary-degraded" | "platform-only-audit" | "mixed-primary-and-user";

export type PlatformHealthMockStatus = "healthy" | "degraded" | "unavailable";

export interface PlatformHealthMockState {
  scenario: PlatformHealthMockScenarioName;
  customCheckPreset: PlatformHealthCustomCheckPresetName;
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
  customChecks: CustomCheck[];
}

declare global {
  interface Window {
    __platformHealth?: {
      getState: () => PlatformHealthMockState;
      getCustomChecks: () => CustomCheck[];
      reset: () => PlatformHealthMockState;
      setScenario: (name: PlatformHealthMockScenarioName) => PlatformHealthMockState;
      setCustomCheckPreset: (name: PlatformHealthCustomCheckPresetName) => PlatformHealthMockState;
      setCustomChecks: (checks: CustomCheck[]) => PlatformHealthMockState;
      clearCustomChecks: () => PlatformHealthMockState;
      setStatus: (id: "primary" | "monitoring" | `remote-${number}`, status: PlatformHealthMockStatus) => PlatformHealthMockState;
    };
  }
}

let state = withCustomChecks(createScenario("single-region-warning"), "none");

export function installPlatformHealthDevControls() {
  window.__platformHealth = {
    getState: () => cloneState(state),
    getCustomChecks: () => state.customChecks.map((check) => structuredClone(check)),
    reset: () => {
      state = withCustomChecks(createScenario("single-region-warning"), "none");
      return cloneState(state);
    },
    setScenario: (name) => {
      state = withCustomChecks(createScenario(name), state.customCheckPreset, state.customChecks);
      return cloneState(state);
    },
    setCustomCheckPreset: (name) => {
      state = withCustomChecks(state, name);
      return cloneState(state);
    },
    setCustomChecks: (checks) => {
      state = withCustomChecks(state, state.customCheckPreset, checks);
      return cloneState(state);
    },
    clearCustomChecks: () => {
      state = withCustomChecks(state, state.customCheckPreset, []);
      return cloneState(state);
    },
    setStatus: (id, status) => {
      state = updateStatus(state, id, status);
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
  if (state.monitoring === null) {
    return null;
  }

  return {
    platform_health_status: state.monitoring?.status ?? "healthy",
    platform_health_version: state.monitoring?.version ?? latestPlatformVersion,
  };
}

export function getPlatformHealthCustomChecks() {
  return state.customChecks.map((check) => structuredClone(check));
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
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        customChecks: [],
      };
    case "single-region-warning":
      return {
        scenario: name,
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "degraded", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        customChecks: [],
      };
    case "single-region-danger":
      return {
        scenario: name,
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "unavailable" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.17.0", status: "degraded", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "unavailable" },
        customChecks: [],
      };
    case "single-region-outdated":
      return {
        scenario: name,
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: latestPlatformVersion, status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: latestPlatformVersion, status: "healthy" },
        customChecks: [],
      };
    case "multi-region-healthy":
      return {
        scenario: name,
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
        ],
        monitoring: null,
        customChecks: [],
      };
    case "multi-region-danger":
      return {
        scenario: name,
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl.CrossRegion", version: latestPlatformVersion, status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.RegionA/api/", version: latestPlatformVersion, status: "healthy", instanceType: "error" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.RegionB/api/", version: latestPlatformVersion, status: "unavailable", instanceType: "error" },
        ],
        monitoring: null,
        customChecks: [],
      };
  }
}

function withCustomChecks(baseState: PlatformHealthMockState, preset: PlatformHealthCustomCheckPresetName, customChecks = createCustomCheckPreset(preset)) {
  return {
    ...baseState,
    customCheckPreset: preset,
    customChecks: customChecks.map((check) => structuredClone(check)),
  } satisfies PlatformHealthMockState;
}

function createCustomCheckPreset(name: PlatformHealthCustomCheckPresetName): CustomCheck[] {
  switch (name) {
    case "user-only":
      return [
        createCustomCheck({
          custom_check_id: "Endpoint dependency check",
          category: "User defined",
          status: Status.Fail,
          failure_reason: "Downstream dependency unavailable",
          originating_endpoint: { name: "Sales.Endpoint", host_id: crypto.randomUUID(), host: "sales-host" },
        }),
      ];
    case "platform-only-primary":
      return [
        createCustomCheck({
          custom_check_id: "ServiceControl Primary Instance",
          category: "Health",
          status: Status.Fail,
          failure_reason: "Critical error detected",
          originating_endpoint: { name: "Particular.ServiceControl", host_id: crypto.randomUUID(), host: "sc-host" },
        }),
      ];
    case "platform-only-primary-degraded":
      return [
        createCustomCheck({
          custom_check_id: "Error Message Ingestion Process",
          category: "ServiceControl Health",
          status: Status.Fail,
          failure_reason: "Error ingestion stopped",
          originating_endpoint: { name: "Particular.ServiceControl", host_id: crypto.randomUUID(), host: "sc-host" },
        }),
      ];
    case "platform-only-audit":
      return [
        createCustomCheck({
          custom_check_id: "Audit Message Ingestion",
          category: "ServiceControl.Audit Health",
          status: Status.Fail,
          failure_reason: "Audit ingestion failed",
          originating_endpoint: { name: "Particular.ServiceControl.Audit", host_id: crypto.randomUUID(), host: "audit-host" },
        }),
      ];
    case "mixed-primary-and-user":
      return [...createCustomCheckPreset("platform-only-primary"), ...createCustomCheckPreset("user-only")];
    case "none":
    default:
      return [];
  }
}

function cloneState(current: PlatformHealthMockState): PlatformHealthMockState {
  return {
    ...current,
    primary: { ...current.primary },
    remotes: current.remotes.map((remote) => ({ ...remote })),
    monitoring: current.monitoring ? { ...current.monitoring } : null,
    customChecks: current.customChecks.map((check) => structuredClone(check)),
  };
}
