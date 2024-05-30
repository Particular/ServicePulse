import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Active Endpoints", () => {
  describe("Rule: Show count of active endpoints", () => {
    it.todo("Not implemented");

    /* SCENARIO
        Given 7 endpoint instances sending heartbeats
        When the hearbeats screen is open
        Then the Active Endpoints tab includes a (7) suffix
      */

    /* SCENARIO
        Given 7 endpoint instances sending heartbeats
        When one of the endpoints stop sending heartbeats
        Then the Active Endpoints tab suffix changes to (6)
      */

    /* SCENARIO
        Given 6 endpoint instances sending heartbeats
        And 1 endpoint instance not sending heartbeats
        When the stopped endpoint starts sending heartbeats
        Then the Active Endpoints tab suffix changes to (7)
      */
  });
  describe("Rule: Show list of active endpoints", () => {
    it.todo("Not implemented");

    /* SCENARIO
        Display Endpoint Instances
        
        Given 3 endpoint instances sending heartbeats
        When the Active Endpoints tab is open
        Then the 3 endpoint instances are displayed
      */

    /* NOTES
        Endpoint name
        Host identifier
        Latest heartbeat received
        
      */

    /* SCENARIO
        Display Logical Endpoints
        
        Given 3 endpoint instances sending heartbeats
          Endpoint1@HOST1
          Endpoint1@HOST2
          Endpoint2@HOST1
        When the Active Endpoints tab is open
        Then 2 logical endpoints are shown
          Endpoint1
          Endpoint2
      */

    /* NOTES
        Endpoint name
        Instance count
        Latest heartbeat received
      */
  });
  describe("Rule: Change display", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Sort list of active endpoints", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Filter list of active endpoints", () => {
    it.todo("Not implemented");
  });
});
describe("FEATURE: Inactive endpoints", () => {
  describe("Rule: Show count of inactive endpoints", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Show list of inactive endpoints", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Change display", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Sort list of inactive endpoints", () => {
    it.todo("Not implemented");
  });
  describe("Rule: Filter list of inactive endpoints", () => {
    it.todo("Not implemented");
  });
});
