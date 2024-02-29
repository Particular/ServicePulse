import { afterEach, beforeAll, vi } from "vitest";
import { mockServer } from "../../mock-server";
import '@testing-library/jest-dom/vitest';


const defaultConfig = {
  default_route: "/dashboard",
  base_url: "/",
  version: "1.2.0",
  service_control_url: "http://localhost:33333/api/",
  monitoring_urls: ["http://localhost:33633/"],
  showPendingRetry: false,
};

vi.stubGlobal("defaultConfig", defaultConfig);

beforeAll(() => {
  mockServer.listen({
    onUnhandledRequest: (request) => {
      console.log("Unhandled %s %s", request.method, request.url);
    },
  });
});
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
