import * as matchers from "@testing-library/jest-dom/matchers";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { mockServer } from "../../mock-server";

expect.extend(matchers);

beforeAll(() => {
  window.defaultConfig = {
		default_route: '/dashboard',
		base_url: '/',
		version: '1.2.0',
		service_control_url: 'http://localhost:33333/api/',
		monitoring_urls: ['http://localhost:33633/'],
		showPendingRetry: false
	};

  mockServer.listen({
    onUnhandledRequest: (request) => {
      console.log("Unhandled %s %s", request.method, request.url);
    },
  })
}
);
afterAll(() => mockServer.close());
afterEach(() => {
  mockServer.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();  
});
