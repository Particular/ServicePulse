import { describe, expect, render, screen, test } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { vi } from "vitest";
import PlatformCapabilitiesDashboardItem from "@/components/platformcapabilities/PlatformCapabilitiesDashboardItem.vue";

vi.mock("@/composables/usePlatformModelAutoRefresh", () => ({
  default: () => ({
    store: {
      refresh: vi.fn(),
    },
  }),
}));

vi.mock("@/composables/useConnectionsAndStatsAutoRefresh", () => ({
  default: () => ({
    store: {
      monitoringConnectionState: {
        unableToConnect: false,
      },
    },
  }),
}));

vi.mock("@/composables/usePlatformCapabilitiesRefresh", () => ({
  default: () => ({
    store: {
      hasSuccessfulMessages: true,
      hasMonitoredEndpoints: true,
    },
  }),
}));

vi.mock("@/components/platformcapabilities/capabilities/AuditingCapability", () => ({
  useAuditingCapability: () => ({
    status: { value: "Available" },
    description: { value: "All ServiceControl Audit instances are available." },
    indicators: { value: [{ label: "Messages", status: "Available", tooltip: "Endpoints have been configured to send audit messages" }] },
    isLoading: { value: false },
    helpButtonText: { value: "View Messages" },
    helpButtonUrl: { value: "/messages" },
  }),
}));

vi.mock("@/components/platformcapabilities/capabilities/MonitoringCapability", () => ({
  useMonitoringCapability: () => ({
    status: { value: "Available" },
    description: { value: "The ServiceControl Monitoring instance is available and endpoints have been configured to send throughput data." },
    indicators: { value: [{ label: "Metrics", status: "Available", tooltip: "Endpoints have been configured to send throughput data" }] },
    isLoading: { value: false },
    helpButtonText: { value: "View Metrics" },
    helpButtonUrl: { value: "/monitoring" },
  }),
}));

vi.mock("@/components/platformcapabilities/capabilities/ErrorCapability", () => ({
  useErrorCapability: () => ({
    status: { value: "Available" },
    description: { value: "The ServiceControl instance is available." },
    indicators: { value: [] },
    isLoading: { value: false },
    helpButtonText: { value: "View Failed Messages" },
    helpButtonUrl: { value: "/failed-messages" },
  }),
}));

describe("PlatformCapabilitiesDashboardItem", () => {
  test("does not render per-instance widgets on capability cards", () => {
    setActivePinia(createTestingPinia({ stubActions: false }));
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { template: "<div />" } },
        { path: "/platform-health", component: { template: "<div />" } },
        { path: "/messages", component: { template: "<div />" } },
        { path: "/monitoring", component: { template: "<div />" } },
        { path: "/failed-messages", component: { template: "<div />" } },
      ],
    });

    render(PlatformCapabilitiesDashboardItem, {
      global: {
        plugins: [router],
      },
    });

    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Metrics")).toBeInTheDocument();
    expect(screen.queryByText("Instance")).not.toBeInTheDocument();
    expect(screen.queryByText("Instance 1")).not.toBeInTheDocument();
  });
});
