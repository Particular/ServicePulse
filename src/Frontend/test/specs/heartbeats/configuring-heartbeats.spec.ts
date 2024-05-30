import { it, describe } from "../../drivers/vitest/driver";

describe("FEATURE: Heartbeats configuration", () => {
  describe("Rule: Show a list of all endpoint instances", () => {
    it.todo("Not implemented");

    /* SCENARIO
      No endpoints
      
      Given no endpoint instances
      When the configuration screen is loaded
      Then the text "Nothing to configure" should be displayed
    */

    /* SCENARIO
      Some endpoints
      
      Given 3 endpoint instances
        Name |
        Foo1
        Foo2
        Foo3
      When the configuration screen is loaded
      Then All 3 endpoints should be displayed
    */

    /* NOTES
      Endpoint name
      Host id
      last reported heartbeat
      Monitoring status
    */
  });
  describe("Rule: Toggle monitoring for endpoint instance off", () => {
    it.todo("Not implemented");

    /* SCENARIO
      Given a monitored endpoint instance
      When the monitoring toggle is clicked
      Then the endpoint instance is no longer monitored
      And should not appear in the inactive endpoints list
      And should not appear in the active endpoints list
    */
  });
  describe("Rule: Toggle monitoring for endpoint instance on", () => {
    it.todo("Not implemented");

    /* SCENARIO
      Given an unmonitored endpoint instance
      And the instance is sending heartbeats
      When the monitoring toggle is clicked
      Then the endpoint instance is monitored
      And should appear in the Active Endpoints list
    */

    /* SCENARIO
      Given an unmonitored endpoint instance
      And the instance is not sending heartbeats
      When the monitoring toggle is clicked
      Then the endpoint instance is monitored
      And should appear in the Inactive Endpoints list
    */
  });
  describe("Rule: Sort endpoint instance list", () => {
    it.todo("Not implemented");

    /* SCENARIO
      Given 3 endpoint instance
        Name |
        Foo1
        Foo2
        Foo3
      When the sort by is set to Name
      Then the instances should be listed in order
    */

    /* NOTES
      Name (asc/desc)
      Latest heartbeat (asc/dec)
    */

    /* SCENARIO
      Given 3 endpoint instance
        Name |
        Foo1
        Foo2
        Foo3
      When the sort by is set to Name (descending)
      Then the instances should be listed in reverse order
    */

    /* SCENARIO
      Same again for Latest heartbeat
    */

    /* SCENARIO
      Given the Sort By field has been changed
      When the page is refreshed
      Then the Sort By field retains its value
      And the Sort By field has the same value on all other Endpoint Heartbeats tabs
    */
  });
  describe("Rule: Filter endpoint list", () => {
    it.todo("Not implemented");

    /* SCENARIO
      Given 3 endpoint instances
        Name | 
        Foo1
        Bar
        Foo2
      When the text "foo" is entered into the filter box
      Then Foo1 should be shown
       And Foo2 should be shown
      And Bar should not be shown
    */

    /* SCENARIO
      Given 3 endpoint instances
        Name | 
        Foo1
        Foo2
        Foo3
      When the text "bar" is entered into the filter box
      Then Foo1 should not be shown
       And Foo2 should not be shown
      And Foo3 should not be shown
    */

    /* SCENARIO
      Given the filter string is ""
      When the text "Foo" is entered into the filter control
      Then the list is filtered (see above)
      And the filter control on the Active Endpoints tab contains "Foo"
      And the filter control on the Inactive endpoints tab contains "Foo"
    */
  });
  describe("Rule: Show performance monitoring warning", () => {
    it.todo("Not implemented");

    /* SCENARIO
      When the configuration screen is loaded
      Then a warning should be displayed about this being disconnected to performance monitoring
    */
  });
});
