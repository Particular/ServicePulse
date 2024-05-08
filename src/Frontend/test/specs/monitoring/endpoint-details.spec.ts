import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Endpoint details", () => {
  describe("RULE: Endpoint details should be able to be viewable", () => {
    it("Example: The endpoint name is clicked from the list of endpoints", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show all the message types for the endpoint", () => {
    it("Example: The endpoint sends a message of type 'Message1'", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show correct counts for message types", () => {
    it("Example: The endpoint has messages of type 'Message1'", async ({ driver }) => {});
    it("Example: The endpoint has messages of type 'Message1' and 'Message2'", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should show all the instances for the endpoint", () => {
    it("Example: The endpoint has 1 instance", async ({ driver }) => {});
    it("Example: The endpoint has been scaled out to 3 instances", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should display endpoint name correctly", () => {
    it("Example: Clicking the endpoint name 'endpoint1", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should display endpoint status correctly", () => {
    it("Example: The endpoint connection status is 'connecnted'", async ({ driver }) => {});
    it("Example: The endpoint connection status is 'disconnecnted'", async ({ driver }) => {});
  });
  describe("RULE: Endpoint details should update on period selector change", () => {
    it("Example: One period is selected from the period selector", async ({ driver }) => {});
    it("Example: Two periods are selected from the period selector", async ({ driver }) => {});
  });
});
