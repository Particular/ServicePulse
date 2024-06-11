import { expect } from "vitest";
import { it, describe } from "../../drivers/vitest/driver";
import * as precondition from "../../preconditions";
import { endpointsDetailsTitle } from "./questions/endpointDetailsTitle";

describe("FEATURE: Endpoint details", () => {
  describe("RULE: The details of an endpoint should be viewable on a dedicated page", () => {
    it.todo("Example: The endpoint name is clicked from the list of endpoints", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should hide if license has expired", () => {
    it.todo("Example: The endpoint has expired license", async ({ driver }) => {});
    it.todo("Example: The endpoint has valid license", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should display endpoint name correctly", () => {
    it("Example: Clicking an endpoint name from the endpoint monitoring list", async ({ driver }) => {
      await driver.setUp(precondition.serviceControlWithMonitoring);
      await driver.setUp(precondition.monitoredEndpointsNamed(["Universe.Solarsystem.Earth.Endpoint1"]));

      await driver.goTo("/monitoring/endpoint/Universe.Solarsystem.Earth.Endpoint1?historyPeriod=1");
      expect(await endpointsDetailsTitle()).toBe("Universe.Solarsystem.Earth.Endpoint1");
    });
  });
  describe("RULE: An indication should be be displayed for the status of an endpoint", () => {
    it.todo("Example: An endpoint has a negative critical time", async ({ driver }) => {});
    it.todo("Example: An endpoint is stale", async ({ driver }) => {});
    it.todo("Example: An endpoint is disconnected from ServiceControl monitoring", async ({ driver }) => {});
    it.todo("Example: An endpoint has failed messages", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show all message types for the endpoint", () => {
    it.todo("Example: The endpoint sends messages of type 'Message1,' 'Message2,' and 'Message3'", async ({ driver }) => {});
    it.todo("Example: Endpoint details should show correct counts for message types", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show all instances of the endpoint", () => {
    it.todo("Example: The endpoint has 1 instance running", async ({ driver }) => {});
    it.todo("Example: The endpoint has 3 instances running", async ({ driver }) => {});
  });
  describe("RULE: Endpoint detail graphs should update on period selector change", () => {
    it.todo("Example: One period is selected from the period selector", async ({ driver }) => {});
    it.todo("Example: Two different periods are selected from the period selector", async ({ driver }) => {});
  });
});
