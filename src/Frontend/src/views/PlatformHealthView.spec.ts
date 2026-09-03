import { describe, expect, render, screen, test, userEvent } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { beforeEach, vi } from "vitest";
import PlatformHealthView from "@/views/PlatformHealthView.vue";
import { usePlatformHealthStore } from "@/stores/PlatformHealthStore";
import { useEnvironmentAndVersionsStore } from "@/stores/EnvironmentAndVersionsStore";
import { usePlatformModelStore } from "@/stores/PlatformModelStore";
import { useCustomChecksStore } from "@/stores/CustomChecksStore";
import type { PlatformModel } from "@/resources/PlatformModel";

const currentReportedAt = new Date().toISOString();

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
    environmentAndVersionsStore.newVersions.newSPVersion.newspversion = true;
    environmentAndVersionsStore.newVersions.newSPVersion.newspversionnumber = "2.10.2";
    environmentAndVersionsStore.newVersions.newSPVersion.newspversionlink = "https://github.com/Particular/ServicePulse/releases/tag/2.10.2";
  });

  test("requires the platform health download before enabling the support link and allows preview", async () => {
    const platformModelStore = usePlatformModelStore();
    const customChecksStore = useCustomChecksStore();
    customChecksStore.replaceFailedChecks([
      {
        id: "customchecks/audit-warning",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: "Fail" as never,
        reported_at: currentReportedAt,
        failure_reason: "Audit ingestion failed",
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit",
          host_id: "host-2",
          host: "Host B",
        },
      },
    ]);
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
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

    await user.click(screen.getByRole("button", { name: /Preview platform health/i }));

    expect(screen.getByLabelText("Platform health JSON preview")).toHaveTextContent('"platformHealth"');
    expect(screen.getByLabelText("Platform health JSON preview")).toHaveTextContent('"customChecks"');
    expect(screen.getByLabelText("Platform health JSON preview")).toHaveTextContent('"Audit Message Ingestion"');

    await user.click(screen.getByRole("button", { name: /Download platform health/i }));

    expect(downloadFileFromString).toHaveBeenCalledTimes(1);
    expect(downloadFileFromString).toHaveBeenCalledWith(expect.stringContaining('"platformHealth"'), "application/json", "platform-health.json");
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        name: "Particular.ServiceControl",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33333/api/"],
        healthDetails: [],
      },
      {
        type: "Audit instance",
        name: "Particular.ServiceControl.Audit",
        version: "6.18.0",
        health: "healthy",
        note: "Audit instance",
        upgradeAvailable: false,
        latestVersion: "",
        upgradeLink: "",
        infoDetails: ["API: http://Particular.ServiceControl.Audit/api/"],
        healthDetails: [],
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

  test("renders names as plain text and shows api urls in expanded details", async () => {
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.queryByRole("link", { name: "Particular.ServiceControl" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Particular.ServiceControl.Audit" })).not.toBeInTheDocument();
    expect(screen.getByText("Particular.ServiceControl")).toBeInTheDocument();
    expect(screen.getAllByText("ServicePulse").length).toBeGreaterThan(0);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: /Healthy/i })[0]);
    expect(screen.getByText("API:")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:33333/api/")).toBeInTheDocument();
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.getByText(/Particular.ServiceControl.Monitoring/i)).toBeInTheDocument();
  });

  test("shows details when clicking a health badge", async () => {
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        name: "Particular.ServiceControl",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33333/api/"],
        healthDetails: [],
      },
      {
        type: "Audit instance",
        name: "Particular.ServiceControl.Audit",
        version: "6.19.3",
        health: "degraded",
        note: "Audit instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33334/api/"],
        healthDetails: ["Audit Message Ingestion: Audit ingestion failed", `Reported at: ${currentReportedAt}`],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Degraded" }));

    expect(screen.getByText("Health issues")).toBeInTheDocument();
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.getAllByText("API:").length).toBeGreaterThan(0);
    expect(screen.getByText("http://localhost:33334/api/")).toBeInTheDocument();
    expect(screen.getByText("Audit Message Ingestion: Audit ingestion failed")).toBeInTheDocument();
    expect(screen.getByText(`Reported at: ${currentReportedAt}`)).toBeInTheDocument();

    rows.mockRestore();
  });

  test("makes healthy rows expandable", async () => {
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        name: "Particular.ServiceControl",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33333/api/"],
        healthDetails: [],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Healthy/i }));
    expect(screen.getByText("API:")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:33333/api/")).toBeInTheDocument();

    rows.mockRestore();
  });

  test("renders the Name header and a ServicePulse version nudge", () => {
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getAllByText("ServicePulse").length).toBeGreaterThan(0);
    expect(screen.getByText(/v2.10.2 available/i)).toBeInTheDocument();
  });

  test("renders health issues before information", async () => {
    const store = usePlatformHealthStore();
    const rows = vi.spyOn(store, "rows", "get").mockReturnValue([
      {
        type: "Error instance",
        name: "Particular.ServiceControl",
        version: "6.19.3",
        health: "healthy",
        note: "Primary error instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33333/api/"],
        healthDetails: [],
      },
      {
        type: "Audit instance",
        name: "Particular.ServiceControl.Audit",
        version: "6.19.3",
        health: "degraded",
        note: "Audit instance",
        upgradeAvailable: false,
        latestVersion: "6.19.3",
        upgradeLink: "",
        infoDetails: ["API: http://localhost:33334/api/"],
        healthDetails: ["Audit Message Ingestion: Audit ingestion failed", `Reported at: ${currentReportedAt}`],
      },
    ]);

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: "Degraded" })[0]);

    const detailsRow = screen.getByText("Health issues").closest("td");
    expect(detailsRow).not.toBeNull();
    expect(detailsRow!.textContent).toMatch(/Health issues.*Information/s);
    rows.mockRestore();
  });

  test("shows no problems detected when expanding ServicePulse", async () => {
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
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    const buttons = screen.getAllByRole("button", { name: /Healthy/i });
    const servicePulseButton = buttons.find((button) => button.getAttribute("aria-controls") === "ServicePulse-ServicePulse-details");
    expect(servicePulseButton).toBeDefined();
    await user.click(servicePulseButton!);

    expect(screen.getByText("No problems detected.")).toBeInTheDocument();
  });

  test("shows the updated primary unavailable wording", async () => {
    const platformModelStore = usePlatformModelStore();
    platformModelStore.model = {
      primary: {
        id: "primary",
        name: "Particular.ServiceControl",
        kind: "error",
        role: "primary-error",
        version: "6.19.3",
        health: "unavailable",
        apiUrl: "http://localhost:33333/api/",
      },
      remotes: [],
      monitoring: null,
      servicePulse: { name: "ServicePulse", version: "2.8.0", health: "healthy" },
    } satisfies PlatformModel;

    render(PlatformHealthView, {
      global: {
        plugins: [],
      },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Unavailable/i }));

    expect(screen.getByText("Primary error instance is unavailable. Remote instance status is also unavailable.")).toBeInTheDocument();
  });
});
