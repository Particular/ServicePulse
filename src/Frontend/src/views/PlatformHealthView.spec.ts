import { describe, expect, render, screen, test, userEvent } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { beforeEach, vi } from "vitest";
import PlatformHealthView from "@/views/PlatformHealthView.vue";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import type { PlatformModel } from "@/resources/PlatformModel";

const downloadFileFromString = vi.fn();

vi.mock("@/composables/fileDownloadCreator", () => ({
  downloadFileFromString: (...args: unknown[]) => downloadFileFromString(...args),
}));

vi.mock("@/composables/usePlatformHealthStoreAutoRefresh", () => ({
  default: () => ({
    store: usePlatformHealthStore(),
  }),
}));

vi.mock("@/composables/useEnvironmentAndVersionsAutoRefresh", () => ({
  default: vi.fn(),
}));

describe("PlatformHealthView", () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia({ stubActions: false }));
    downloadFileFromString.mockReset();

    const environmentAndVersionsStore = useEnvironmentAndVersionsStore();
    environmentAndVersionsStore.newVersions.newSCVersion.newscversion = true;
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionnumber = "6.19.3";
    environmentAndVersionsStore.newVersions.newSCVersion.newscversionlink = "https://github.com/Particular/ServiceControl/releases/tag/6.19.3";
  });

  test("requires the configuration download before enabling the support link", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
      primary: {
        id: "primary",
        name: "Particular.ServiceControl",
        kind: "error",
        role: "primary-error",
        version: "6.19.3",
        health: "healthy",
        apiUrl: "http://localhost:33333/api/",
      },
      remotes: [],
      monitoring: null,
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /Open support case/i }));

    const supportLink = screen.getByRole("link", { name: /Then open the support case/i });
    expect(supportLink).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("button", { name: /Download platform configuration/i }));

    expect(downloadFileFromString).toHaveBeenCalledTimes(1);
    expect(downloadFileFromString).toHaveBeenCalledWith(expect.stringContaining('"platformHealth"'), "application/json", "platform-configuration.json");
    expect(supportLink).toHaveAttribute("aria-disabled", "false");
  });

  test("shows an inline upgrade cue for an outdated instance version", () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
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
      ],
      monitoring: null,
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.queryByText(/Outdated/i)).not.toBeInTheDocument();
    expect(screen.getByText(/v6.19.3 available/i)).toBeInTheDocument();
  });

  test("does not show an upgrade cue when no newer version is known", () => {
    const store = usePlatformHealthStore();
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
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
      ],
      monitoring: null,
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        instanceName: "Particular.ServiceControl",
        apiUrl: "http://localhost:33333/api/",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "",
        upgradeLink: "",
        isExpandable: false,
        details: [],
      },
      {
        type: "Audit instance",
        instanceName: "Particular.ServiceControl.Audit",
        apiUrl: "http://Particular.ServiceControl.Audit/api/",
        version: "6.18.0",
        health: "healthy",
        note: "Audit instance",
        upgradeAvailable: false,
        latestVersion: "",
        upgradeLink: "",
        isExpandable: false,
        details: [],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.queryByText(/v6\.19\.3 available/i)).not.toBeInTheDocument();

    rows.mockRestore();
  });

  test("links each instance name to the instance api url", () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
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
          version: "6.19.3",
          health: "healthy",
          apiUrl: "http://localhost:33334/api/",
        },
      ],
      monitoring: null,
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.getByRole("link", { name: "Particular.ServiceControl" })).toHaveAttribute("href", "http://localhost:33333/api/");
    expect(screen.getByRole("link", { name: "Particular.ServiceControl.Audit" })).toHaveAttribute("href", "http://localhost:33334/api/");
  });

  test("renders monitoring when present alongside remote error instances", () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
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
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.getByText(/Particular.ServiceControl.Monitoring/i)).toBeInTheDocument();
  });

  test("shows details when clicking a degraded health badge", async () => {
    const store = usePlatformHealthStore();
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
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
          version: "6.19.3",
          health: "degraded",
          apiUrl: "http://localhost:33334/api/",
        },
      ],
      monitoring: null,
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        instanceName: "Particular.ServiceControl",
        apiUrl: "http://localhost:33333/api/",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        isExpandable: false,
        details: [],
      },
      {
        type: "Audit instance",
        instanceName: "Particular.ServiceControl.Audit",
        apiUrl: "http://localhost:33334/api/",
        version: "6.19.3",
        health: "degraded",
        note: "Audit instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        isExpandable: true,
        details: ["Audit Message Ingestion: Audit ingestion failed"],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Degraded" }));

    expect(screen.getByText("Audit Message Ingestion: Audit ingestion failed")).toBeInTheDocument();

    rows.mockRestore();
  });

  test("does not make healthy rows expandable", () => {
    const store = usePlatformHealthStore();
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
      primary: {
        id: "primary",
        name: "Particular.ServiceControl",
        kind: "error",
        role: "primary-error",
        version: "6.19.3",
        health: "healthy",
        apiUrl: "http://localhost:33333/api/",
      },
      remotes: [],
      monitoring: null,
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        instanceName: "Particular.ServiceControl",
        apiUrl: "http://localhost:33333/api/",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        isExpandable: false,
        details: [],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.queryByRole("button", { name: "Healthy" })).not.toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();

    rows.mockRestore();
  });
});
