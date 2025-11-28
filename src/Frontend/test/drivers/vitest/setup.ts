import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { mockServer } from "../../mock-server";
import "@testing-library/jest-dom/vitest";
import monitoringClient from "@/components/monitoring/monitoringClient";
import serviceControlClient from "@/components/serviceControlClient";

const defaultConfig = {
  default_route: "/dashboard",
  version: "1.2.0",
  service_control_url: "http://localhost:33333/api/",
  monitoring_urls: ["http://localhost:33633/"],
  showPendingRetry: false,
};

export function disableMonitoring() {
  vi.stubGlobal("defaultConfig", { ...defaultConfig, ...{ monitoring_urls: ["!"] } });
  monitoringClient.resetUrl();
  serviceControlClient.resetUrl();
}

beforeEach(() => {
  vi.stubGlobal("defaultConfig", defaultConfig);
  monitoringClient.resetUrl();
  serviceControlClient.resetUrl();
});

beforeAll(() => {
  console.log("Starting mock server");

  mockServer.listen({
    onUnhandledRequest: (_, print) => {
      print.warning();
    },
  });
});

afterAll(() => {
  console.log("Shutting down mock server");
  mockServer.close();
});
