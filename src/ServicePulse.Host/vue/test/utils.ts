import { makeMockEndpoint } from "./mock-endpoint";
import userEvent from "@testing-library/user-event";

import { mockServer } from "./mock-server";
import { vi } from "vitest";

export { render, screen } from "@testing-library/vue";
export { expect, it, describe } from "vitest";
export { userEvent };

export const mockEndpoint = makeMockEndpoint({ mockServer });
export const config = {
  consoleLog: vi.spyOn(console, "log").mockImplementation(() => undefined),
  consoleDebug: vi.spyOn(console, "debug").mockImplementation(() => undefined),
  turnOnConsole: () => {
    config.consoleLog.mockRestore();
    config.consoleDebug.mockRestore();
  },
  turnOffConsole: () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "debug").mockImplementation(() => undefined);
  },
  consoleReset: () => {
    // Suppress the console.log and console.debug for each test run by default
    config.turnOffConsole();
  },
};
