import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
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
    const platformModelStore = usePlatformModelStore();
    platformModelStore.refresh = vi.fn(() => {
      platformModelStore.model = singleRegionWarningModel;
      return Promise.resolve();
    });
    const store = usePlatformHealthStore();

    await store.refresh();

    expect(store.isMultiRegion).toBe(false);
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

    expect(store.isMultiRegion).toBe(true);
    expect(store.severity).toBe("danger");
    expect(store.rows).toHaveLength(3);
    expect(store.rows.every((row) => row.type === "Error instance" || row.type === "Monitoring instance")).toBe(true);
    expect(store.issueSummary).toContain("unavailable Error instance");
  });

  test("uses dev mock state as a latest-version fallback for upgrade cues", async () => {
    const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber = "";
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink = "";
    window.__platformHealth = {
      getState: () => ({
        scenario: "single-region-warning",
        primary: { name: "Particular.ServiceControl", version: "6.19.3", status: "healthy" },
        remotes: [],
        monitoring: { configured: true, version: "6.19.3", status: "healthy" },
        warnings: [],
      }),
      reset: vi.fn(),
      setScenario: vi.fn(),
      setStatus: vi.fn(),
      setWarnings: vi.fn(),
      clearWarnings: vi.fn(),
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
    expect(store.outdatedOnly).toBe(false);
  });
});

const singleRegionWarningModel: PlatformModel = {
  mode: "single-region",
  primary: {
    id: "primary",
    name: "Particular.ServiceControl",
    kind: "error",
    role: "primary-error",
    version: "6.19.3",
    health: "healthy",
    configured: true,
    ingestErrorMessages: true,
  },
  remotes: [
    {
      id: "remote-0",
      name: "Particular.ServiceControl.Audit",
      kind: "audit",
      role: "remote-audit",
      version: "6.18.0",
      health: "healthy",
      configured: true,
    },
    {
      id: "remote-1",
      name: "Particular.ServiceControl.Audit-Blue",
      kind: "audit",
      role: "remote-audit",
      version: "6.17.0",
      health: "degraded",
      configured: true,
    },
  ],
  monitoring: {
    id: "monitoring",
    name: "Particular.ServiceControl.Monitoring",
    kind: "monitoring",
    role: "monitoring",
    version: "6.19.3",
    health: "healthy",
    configured: true,
  },
  warnings: [],
};

const multiRegionDangerModel: PlatformModel = {
  mode: "multi-region",
  primary: {
    id: "primary",
    name: "Particular.ServiceControl.CrossRegion",
    kind: "error",
    role: "cross-region-primary",
    version: "6.19.3",
    health: "healthy",
    configured: true,
    ingestErrorMessages: false,
  },
  remotes: [
    {
      id: "remote-0",
      name: "Particular.ServiceControl.RegionA",
      kind: "error",
      role: "remote-error",
      version: "6.19.3",
      health: "healthy",
      configured: true,
      ingestErrorMessages: true,
    },
    {
      id: "remote-1",
      name: "Particular.ServiceControl.RegionB",
      kind: "error",
      role: "remote-error",
      version: "6.19.3",
      health: "unavailable",
      configured: true,
      ingestErrorMessages: true,
    },
  ],
  monitoring: null,
  warnings: [],
};
