import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { Status } from "@/resources/CustomCheck";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import type { PlatformModel } from "@/resources/PlatformModel";
import logger from "@/logger";

const currentReportedAt = new Date().toISOString();

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
    environmentAndVersionsStore.newVersions.newSPVersion.newspversion = true;
    environmentAndVersionsStore.newVersions.newSPVersion.newspversionnumber = "2.10.2";
    environmentAndVersionsStore.newVersions.newSPVersion.newspversionlink = "https://github.com/Particular/ServicePulse/releases/tag/2.10.2";

    vi.spyOn(logger, "warn").mockImplementation(() => undefined);

    const customChecksStore = useCustomChecksStore();
    customChecksStore.refresh = vi.fn(() => Promise.resolve());
  });

  test("derives warning severity and audit-remote rows", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-warning",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        internal: true,
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
    expect(store.rows).toHaveLength(5);
    expect(store.outdatedOnly).toBe(false);
    expect(store.rows[2].upgradeAvailable).toBe(true);
    expect(store.rows[2].latestVersion).toBe("6.19.3");
    expect(store.rows[0].infoDetails[0]).toBe("API: http://localhost:33333/api/");
    expect(store.rows[4].type).toBe("ServicePulse");
    expect(store.rows[4].upgradeAvailable).toBe(true);
    expect(store.rows[4].latestVersion).toBe("2.10.2");
    expect(store.rows[4].infoDetails).toEqual([]);
    expect(store.rows[4].healthDetails).toEqual(["No problems detected."]);
    expect(store.rows[2].healthDetails).toContain(`Reported at: ${currentReportedAt}`);
    expect(store.issueSummary).toContain("1 issue detected");
    expect(store.issueSummary).toContain("degraded Audit instance");
    expect(store.issueSummary).not.toContain("unavailable Monitoring instance");
    expect(store.supportDownloadJson).toContain('"platformHealth"');
  });

  test("derives danger severity for an unavailable remote error instance", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = remoteErrorsDangerModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.severity).toBe("danger");
    expect(store.rows).toHaveLength(4);
    expect(store.rows.filter((row) => row.type !== "ServicePulse").every((row) => row.type === "Error instance" || row.type === "Monitoring instance")).toBe(true);
    expect(store.issueSummary).toContain("unavailable Error instance");
  });

  test("derives danger severity for unavailable audit remotes", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = {
        ...singleRegionWarningModel,
        remotes: singleRegionWarningModel.remotes.map((remote) => ({
          ...remote,
          health: "unavailable",
        })),
      };
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.severity).toBe("danger");
    expect(store.issueSummary).toContain("unavailable Audit instance");
    expect(store.rows[1].infoDetails).toContain("API: http://Particular.ServiceControl.Audit/api/");
    expect(store.rows[1].healthDetails).toContain("Audit instance is unavailable.");
    expect(store.rows[2].infoDetails).toContain("API: http://Particular.ServiceControl.Audit-Blue/api/");
    expect(store.rows[2].healthDetails).toContain("Audit instance is unavailable.");
  });

  test("includes monitoring unavailability in the issue summary whenever monitoring is configured", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = {
        ...remoteErrorsDangerModel,
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
        scenario: "audit-remotes-healthy",
        customCheckPreset: "none",
        primary: { name: "Particular.ServiceControl", version: "6.19.3", status: "healthy" },
        remotes: [
          { id: "remote-0", name: "Particular.ServiceControl.Audit", apiUri: "http://Particular.ServiceControl.Audit/api/", version: "6.18.0", status: "healthy", instanceType: "audit" },
          { id: "remote-1", name: "Particular.ServiceControl.Audit-Blue", apiUri: "http://Particular.ServiceControl.Audit-Blue/api/", version: "6.19.3", status: "healthy", instanceType: "audit" },
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

  test("applies internal platform custom checks to platform health only", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/primary",
        custom_check_id: "ServiceControl Primary Instance",
        category: "Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Critical error detected",
        internal: true,
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
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        internal: true,
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

    expect(store.payload?.primary.health).toBe("degraded");
    expect(store.payload?.remotes[0].health).toBe("healthy");
    expect(store.payload?.remotes[1].health).toBe("degraded");
    expect(store.severity).toBe("warning");
  });

  test("maps internal degraded primary custom checks to primary degraded", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/primary-degraded",
        custom_check_id: "Error Message Ingestion Process",
        category: "ServiceControl Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Error ingestion stopped",
        internal: true,
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
    expect(store.rows[0].infoDetails).toContain("API: http://localhost:33333/api/");
    expect(store.issueSummary).toContain("primary Error instance degraded");
    expect(store.rows[0].healthDetails).toContain("Error Message Ingestion Process: Error ingestion stopped");
    expect(store.rows[0].healthDetails).toContain(`Reported at: ${currentReportedAt}`);
  });

  test("does not degrade an audit instance when the internal check belongs to another audit instance", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-other-instance",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        internal: true,
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

  test("maps the audit degraded preset to the targeted audit instance name from remote configuration", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-targeted-instance",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        internal: true,
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit-Blue",
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

    expect(store.payload?.remotes[0].health).toBe("healthy");
    expect(store.payload?.remotes[1].health).toBe("degraded");
  });

  test("refreshes custom checks alongside the platform model and keeps rendering when custom checks fail", async () => {
    const customChecksStore = useCustomChecksStore();
    customChecksStore.refresh = vi.fn(() => Promise.reject(new Error("custom checks unavailable")));

    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = singleRegionWarningModel;
      return Promise.resolve();
    });

    const store = usePlatformHealthStore();

    await store.refresh();

    expect(customChecksStore.refresh).toHaveBeenCalledTimes(1);
    expect(platformModelStore.refresh).toHaveBeenCalledTimes(1);
    expect(store.payload?.primary.health).toBe("healthy");
    expect(logger.warn).toHaveBeenCalledWith("Unable to refresh custom checks for platform health", expect.any(Error));
  });

  test("recomputes payload-derived state when failed checks change after refresh", async () => {
    const customChecksStore = useCustomChecksStore();
    const platformModelStore = usePlatformModelStore();

    customChecksStore.refresh = vi.fn(() => Promise.resolve());
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

    expect(store.severity).toBe("none");

    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-targeted-instance",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: Status.Fail,
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        internal: true,
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit-Blue",
          host_id: "host-2",
          host: "Host B",
        },
      },
    ]);

    await nextTick();

    expect(store.payload?.remotes[1].health).toBe("degraded");
    expect(store.severity).toBe("warning");
    expect(store.rows[2].infoDetails).toContain("API: http://Particular.ServiceControl.Audit-Blue/api/");
    expect(store.rows[2].healthDetails).toContain("Audit Message Ingestion: Audit ingestion failed");
    expect(store.rows[2].healthDetails).toContain(`Reported at: ${currentReportedAt}`);
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
  servicePulse: {
    name: "ServicePulse",
    version: "2.8.0",
    health: "healthy",
  },
};

const remoteErrorsDangerModel: PlatformModel = {
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
  servicePulse: {
    name: "ServicePulse",
    version: "2.8.0",
    health: "healthy",
  },
};
