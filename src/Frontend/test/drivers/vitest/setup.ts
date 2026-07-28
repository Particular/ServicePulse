import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { config } from "@vue/test-utils";
import { mockServer } from "../../mock-server";
import "@testing-library/jest-dom/vitest";
import monitoringClient from "@/components/monitoring/monitoringClient";
import serviceControlClient from "@/components/serviceControlClient";
import VueTippy from "vue-tippy";

function getBoundingClientRect(): DOMRect {
  const rect = {
    x: 0,
    y: 0,
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
  };

  return { ...rect, toJSON: () => rect };
}

class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
  item(index: number): DOMRect | null {
    return this[index];
  }
}

// Removes test warning noise failing to resolve tippy
if (!config.global.plugins.includes(VueTippy)) {
  config.global.plugins.push(VueTippy);
}

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
  document.elementFromPoint = (): null => null;
  HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect;
  HTMLElement.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList();
  Range.prototype.getBoundingClientRect = getBoundingClientRect;
  Range.prototype.getClientRects = (): DOMRectList => new FakeDOMRectList();

  mockServer.listen({
    onUnhandledRequest: (_, print) => {
      print.warning();
    },
  });
});

afterAll(() => {
  mockServer.close();
});
