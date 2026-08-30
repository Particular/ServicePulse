import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { Status } from "@/resources/CustomCheck";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import type { PlatformModel } from "@/resources/PlatformModel";

describe("PlatformHealthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.__platformHealth = undefined;

    const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
    environmentAndVersionsStore.newVersions.newSCVersion.newscversion = true;
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber = "6.19.3";
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink = "https://github.com/Particular/ServiceControl/releases/tag/6.19.3";
    environmentAndVersionsStore.newVersions.newMVersion.newmversion = true;
    environmentAndVersionsStore.newVersions.newMVersion.newmversionnumber = "6.19.3";
    environmentAndVersionsStore.newVersions.newMVersion.newmversionlink = "https://github.com/Particular/ServiceControl/releases/tag/6.19.3";
  });

  test("derives warning severity and single-region rows", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-warning",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: "2025-01-10T05:06:30.4074087Z",
        failure_reason: "Audit ingestion failed",
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit-Blue",
          host_id: "host-2",
          host: "Host B",
        },
      },
    ]);

    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = singleRegionWarningModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.severity).toBe("warning");
    expect(store.rows).toHaveLength(4);
    expect(store.outdatedOnly).toBe(false);
    expect(store.rows[2].upgradeAvailable).toBe(true);
    expect(store.rows[2].latestVersion).toBe("6.19.3");
    expect(store.issueSummary).toContain("1 issue detected");
    expect(store.issueSummary).toContain("degraded Audit instance");
    expect(store.issueSummary).not.toContain("unavailable Monitoring instance");
    expect(store.supportDownloadJson).toContain('"platformHealth"');
  });

  test("derives danger severity for multi-region degraded remote error", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = multiRegionDangerModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.severity).toBe("danger");
    expect(store.rows).toHaveLength(3);
    expect(store.rows.every((row) => row.type === "Error instance" || row.type === "Monitoring instance")).toBe(true);
    expect(store.issueSummary).toContain("unavailable Error instance");
  });

  test("includes monitoring unavailability in the issue summary whenever monitoring is configured", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = {
        ...multiRegionDangerModel,
        monitoring: {
          id: "monitoring",
          name: "Particular.ServiceControl.Monitoring",
          kind: "monitoring",
          role: "monitoring",
          version: "6.19.3",
          health: "unavailable",
          apiUrl: "http://localhost:33633/",
        },
      };
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.severity).toBe("danger");
    expect(store.issueSummary).toContain("unavailable Error instance");
    expect(store.issueSummary).toContain("unavailable Monitoring instance");
  });

  test("uses dev mock state as a latest-version fallback for upgrade cues", async () => {
    const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber = "";
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink = "";
    window.__platformHealth = {
      getState: () => ({
        scenario: "single-region-healthy",
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: "6.19.3", status: "healthy" },
        remotes: [
          { id: "remote-0", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.19.3", status: "healthy", instanceType: "audit" },
        ],
        monitoring: { configured: true, version: "6.18.0", status: "healthy" },
        customChecks: [],
      }),
      getCustomChecks: vi.fn(() => []),
      reset: vi.fn(),
      setScenario: vi.fn(),
      setCustomCheckPreset: vi.fn(),
      setCustomChecks: vi.fn(),
      clearCustomChecks: vi.fn(),
      setStatus: vi.fn(),
    };
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = singleRegionWarningModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.rows[2].upgradeAvailable).toBe(true);
    expect(store.rows[2].latestVersion).toBe("6.19.3");
    expect(store.outdatedOnly).toBe(true);
  });

  test("applies hidden built-in platform custom checks to platform health only", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/primary",
        custom_check_id: "ServiceControl Primary Instance",
        category: "Health",
        status: Status.Fail,
        reported_at: "2025-01-10T05:06:30.4074087Z",
        failure_reason: "Critical error detected",
        originating_endpoint: {
          name: "Particular.ServiceControl",
          host_id: "host-1",
          host: "Host A",
        },
      },
      {
        id: "customchecks/audit",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: "2025-01-10T05:06:30.4074087Z",
        failure_reason: "Audit ingestion failed",
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit-Blue",
          host_id: "host-2",
          host: "Host B",
        },
      },
    ]);

    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = singleRegionWarningModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.payload?.primary.health).toBe("unavailable");
    expect(store.payload?.remotes[0].health).toBe("healthy");
    expect(store.payload?.remotes[1].health).toBe("degraded");
    expect(store.severity).toBe("danger");
  });

  test("maps built-in degraded primary custom checks to primary degraded", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/primary-degraded",
        custom_check_id: "Error Message Ingestion Process",
        category: "ServiceControl Health",
        status: Status.Fail,
        reported_at: "2025-01-10T05:06:30.4074087Z",
        failure_reason: "Error ingestion stopped",
        originating_endpoint: {
          name: "Particular.ServiceControl",
          host_id: "host-1",
          host: "Host A",
        },
      },
    ]);

    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = {
        ...singleRegionWarningModel,
        primary: {
          ...singleRegionWarningModel.primary,
          health: "healthy",
        },
        remotes: singleRegionWarningModel.remotes.map((remote) => ({
          ...remote,
          health: "healthy",
        })),
      };
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.payload?.primary.health).toBe("degraded");
    expect(store.severity).toBe("warning");
    expect(store.issueSummary).toContain("primary Error instance degraded");
    expect(store.rows[0].details).toContain("Error Message Ingestion Process: Error ingestion stopped");
  });

  test("does not degrade an audit instance when the built-in check belongs to another audit instance", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-other-instance",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: "2025-01-10T05:06:30.4074087Z",
        failure_reason: "Audit ingestion failed",
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit.Other",
          host_id: "host-2",
          host: "Host B",
        },
      },
    ]);

    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = {
        ...singleRegionWarningModel,
        remotes: singleRegionWarningModel.remotes.map((remote) => ({
          ...remote,
          health: "healthy",
        })),
      };
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.payload?.remotes.every((remote) => remote.health === "healthy")).toBe(true);
    expect(store.severity).toBe("none");
  });
});

const singleRegionWarningModel: PlatformModel = {
  primary: {
    id: "primary",
    name: "Particular.ServiceControl",
    kind: "error",
    role: "primary-error",
    version: "6.19.3",
    health: "healthy",
    apiUrl: "http://localhost:33333/api/",
  },
  remotes: [
    {
      id: "remote-0",
      name: "Particular.ServiceControl.Audit",
      kind: "audit",
      role: "remote-audit",
      version: "6.18.0",
      health: "healthy",
      apiUrl: "http://Particular.ServiceControl.Audit/api/",
    },
    {
      id: "remote-1",
      name: "Particular.ServiceControl.Audit-Blue",
      kind: "audit",
      role: "remote-audit",
      version: "6.17.0",
      health: "healthy",
      apiUrl: "http://Particular.ServiceControl.Audit-Blue/api/",
    },
  ],
  monitoring: {
    id: "monitoring",
    name: "Particular.ServiceControl.Monitoring",
    kind: "monitoring",
    role: "monitoring",
    version: "6.19.3",
    health: "healthy",
    apiUrl: "http://localhost:33633/",
  },
};

const multiRegionDangerModel: PlatformModel = {
  primary: {
    id: "primary",
    name: "Particular.ServiceControl.CrossRegion",
    kind: "error",
    role: "primary-error",
    version: "6.19.3",
    health: "healthy",
    apiUrl: "http://localhost:33333/api/",
  },
  remotes: [
    {
      id: "remote-0",
      name: "Particular.ServiceControl.RegionA",
      kind: "error",
      role: "remote-error",
      version: "6.19.3",
      health: "healthy",
      apiUrl: "http://Particular.ServiceControl.RegionA/api/",
    },
    {
      id: "remote-1",
      name: "Particular.ServiceControl.RegionB",
      kind: "error",
      role: "remote-error",
      version: "6.19.3",
      health: "unavailable",
      apiUrl: "http://Particular.ServiceControl.RegionB/api/",
    },
  ],
  monitoring: null,
};
