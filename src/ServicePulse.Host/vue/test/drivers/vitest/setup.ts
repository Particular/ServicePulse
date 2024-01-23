import * as matchers from "@testing-library/jest-dom/matchers";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import { mockServer } from "../../mock-server";

expect.extend(matchers);

beforeAll(() =>
  mockServer.listen({
    onUnhandledRequest: (request) => {
      console.log("Unhandled %s %s", request.method, request.url);
    },
  })
);
afterAll(() => mockServer.close());
afterEach(() => {
  mockServer.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});
