import { Status, type default as CustomCheck } from "@/resources/CustomCheck";
import type { RemoteInstance } from "@/resources/RemoteInstance";
import type RootUrls from "@/resources/RootUrls";
import { createCustomCheck } from "../preconditions/customChecks";
import { clonePlatformTopology, createPlatformTopology, latestPlatformVersion, toRemoteInstances, type PlatformTopology, type PlatformTopologyScenarioName, type PlatformTopologyStatus, updatePlatformTopologyStatus } from "./platform-topology";

export type PlatformHealthMockScenarioName = PlatformTopologyScenarioName;
export type PlatformHealthCustomCheckPresetName = "none" | "user-only" | "platform-only-primary" | "platform-only-primary-degraded" | "platform-only-audit" | "mixed-primary-and-user";

export type PlatformHealthMockStatus = Exclude<PlatformTopologyStatus, "degraded">;

const currentReportedAt = new Date().toISOString();

export interface PlatformHealthMockState extends PlatformTopology {
  customCheckPreset: PlatformHealthCustomCheckPresetName;
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

let state = withCustomChecks(createScenario("audit-remotes-healthy"), "none");

export function installPlatformHealthDevControls() {
  window.__platformHealth = {
    getState: () => cloneState(state),
    getCustomChecks: () => state.customChecks.map((check) => structuredClone(check)),
    reset: () => {
      state = withCustomChecks(createScenario("audit-remotes-healthy"), "none");
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
  return toRemoteInstances(state);
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
  return {
    ...updatePlatformTopologyStatus(current, id, status),
    customCheckPreset: current.customCheckPreset,
    customChecks: current.customChecks.map((check) => structuredClone(check)),
  };
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
          reported_at: currentReportedAt,
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
          reported_at: currentReportedAt,
          failure_reason: "Critical error detected",
          internal: true,
          originating_endpoint: { name: "Particular.ServiceControl", host_id: crypto.randomUUID(), host: "sc-host" },
        }),
      ];
    case "platform-only-primary-degraded":
      return [
        createCustomCheck({
          custom_check_id: "Error Message Ingestion Process",
          category: "ServiceControl Health",
          status: Status.Fail,
          reported_at: currentReportedAt,
          failure_reason: "Error ingestion stopped",
          internal: true,
          originating_endpoint: { name: "Particular.ServiceControl", host_id: crypto.randomUUID(), host: "sc-host" },
        }),
      ];
    case "platform-only-audit":
      return [
        createCustomCheck({
          custom_check_id: "Audit Message Ingestion",
          category: "ServiceControl.Audit Health",
          status: Status.Fail,
          reported_at: currentReportedAt,
          failure_reason: "Audit ingestion failed",
          internal: true,
          originating_endpoint: { name: "Particular.ServiceControl.Audit-Blue", host_id: crypto.randomUUID(), host: "audit-host" },
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
    ...clonePlatformTopology(current),
    customCheckPreset: current.customCheckPreset,
    customChecks: current.customChecks.map((check) => structuredClone(check)),
  };
}

function createScenario(name: PlatformHealthMockScenarioName): PlatformHealthMockState {
  return {
    ...createPlatformTopology(name),
    customCheckPreset: "none",
    customChecks: [],
  };
}
